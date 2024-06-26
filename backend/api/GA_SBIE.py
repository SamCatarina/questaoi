#!/usr/bin/env python
# coding: utf-8
#http://127.0.0.1:5000/adicionar_aluno
import pandas as pd
import numpy as np
import random
import ast
from flask import Flask, request, jsonify

app = Flask(__name__)

# Funções existentes
dataset = pd.read_csv('turma_AG.csv')

# transformando '[string'] em [array]
dataset['conhecimento_consolidado'] = dataset['conhecimento_consolidado'].apply(ast.literal_eval)
dataset['conhecimento_para_aperfeicoar'] = dataset['conhecimento_para_aperfeicoar'].apply(ast.literal_eval)

def grupo_aleatorio(qtd_grupos, qtd_alunos):
    solucao = []
    for i in range(0, qtd_alunos):
        solucao.append(random.randint(1, qtd_grupos))
    return solucao

def pop_inicial(tamanho_populacao, grupos, qtd_alunos):
    populacao_aleatoria = [] #inicial
    for i in range(0, tamanho_populacao):
        solucao = grupo_aleatorio(grupos, qtd_alunos)
        populacao_aleatoria.append(solucao)
    return populacao_aleatoria

def sub_grupo(solucao, grupo):
    alunos_grupo_x = []
    for index, value in enumerate(solucao):
        if value == grupo:
            alunos_grupo_x.append(index)
    return alunos_grupo_x

def fitness_grupo(grupo, df, qtd_grupos):
    conhecimento_complementar = 0 # conhecimento de um é a dificuldade de outro
    turno_compativel = 0
    fitness = 0

    for estudante in grupo: 
        for colega in grupo:
            if df['id_aluno'][estudante] != df['id_aluno'][colega]:
                for consolidado in df['conhecimento_consolidado'][estudante]:
                    if consolidado in df['conhecimento_para_aperfeicoar'][colega]:
                        conhecimento_complementar += 1
                        
                if df['turno_disponivel'][estudante] == df['turno_disponivel'][colega]:
                    turno_compativel += 1

    turno_compativel = turno_compativel / 2
    tamanho_grupo_ideal = int(len(df) / qtd_grupos)
    diferenca_tamanho = abs(tamanho_grupo_ideal - len(grupo))
    
    fitness = (
        (conhecimento_complementar * 0.3) + (turno_compativel * 0.3)
    ) - (diferenca_tamanho * 0.4)
    
    if len(grupo) < tamanho_grupo_ideal - 1:
        if len(grupo) < 2:
            fitness = fitness - 50
        else:
            fitness = fitness - 5
    if len(grupo) > tamanho_grupo_ideal + 1:
        fitness = fitness - 5
    
    return fitness

def fitness(solucao, grupos, df):
    fitness_individuo = 0
    for grupo in range(1, grupos + 1):
        alunos_grupo_x = sub_grupo(solucao, grupo)
        fit_temp = fitness_grupo(alunos_grupo_x, df, grupos)
        fitness_individuo += fit_temp
    return fitness_individuo

def fit_populacao(populacao, grupos, df):
    fitness_populacao = []
    for solucao in populacao:
        fitness_populacao.append(fitness(solucao, grupos, df))
        
    minimo = min(fitness_populacao)
    maximo = max(fitness_populacao)
    
    fitness_normalizado = []
    for value in fitness_populacao:
        x = (value - minimo) / (maximo - minimo)
        fitness_normalizado.append(x)
    
    return fitness_normalizado

def elitismo(fitness_populacao):
    melhor_individuo_index = fitness_populacao.index(max(fitness_populacao))
    return melhor_individuo_index

def roleta(populacao, aptidoes): 
    selecionados = []
    selecionados.append(populacao[elitismo(aptidoes)])
    soma_aptidoes = sum(aptidoes)
    
    for indice, aptidao in enumerate(aptidoes):
        rand = random.random()
        if rand < aptidao:
            selecionados.append(populacao[indice])
    return selecionados

def cruzamento_ponto_unico(pai1, pai2):
    assert len(pai1) == len(pai2), "Os pais devem ter o mesmo comprimento"
    ponto_corte = random.randint(1, len(pai1) - 1)
    filho1 = pai1[:ponto_corte] + pai2[ponto_corte:]
    filho2 = pai2[:ponto_corte] + pai1[ponto_corte:]
    return filho1, filho2

def mutacao(individuo, taxa_mutacao):
    for i in range(len(individuo)):
        if random.random() < taxa_mutacao:
            individuo[i] = random.randint(1, 5)
    return individuo

def gerar_nova_populacao(populacao_temporaria, tamanho_populacao, taxa_cruzamento, taxa_mutacao):
    nova_populacao = []
    while len(nova_populacao) < tamanho_populacao:
        pai1, pai2 = random.sample(populacao_temporaria, 2)
        
        if random.random() < taxa_cruzamento:
            filho1, filho2 = cruzamento_ponto_unico(pai1, pai2)
        else:
            filho1, filho2 = pai1, pai2
        
        filho1 = mutacao(filho1, taxa_mutacao)
        filho2 = mutacao(filho2, taxa_mutacao)
        
        nova_populacao.append(filho1)
        if len(nova_populacao) < tamanho_populacao:
            nova_populacao.append(filho2)
    
    return nova_populacao

def elementos_por_grupo(individuo, grupos, df):
    for i in range(1, grupos + 1):
        print("\nGrupo {}".format(i))
        grupo = sub_grupo(individuo, i)
   
        for estudante in grupo:
            print(df.loc[estudante])

# Função para adicionar um novo aluno
def adicionar_aluno(novo_aluno):
    global dataset
    dataset = dataset.append(novo_aluno, ignore_index=True)
    dataset.to_csv('turma_AG.csv', index=False)

# Definindo a API
@app.route('/adicionar_aluno', methods=['POST'])
def api_adicionar_aluno():
    novo_aluno = request.json
    adicionar_aluno(novo_aluno)
    
    grupos = 5
    tamanho_populacao = 100
    qtd_alunos = len(dataset)
    tx_crossover = 0.75
    tx_mutacao = 0.01
    
    populacao = pop_inicial(tamanho_populacao, grupos, qtd_alunos)
    
    epocas = 0
    while epocas < 50:
        fitness_populacao = fit_populacao(populacao, grupos, dataset)
        selecionados = roleta(populacao, fitness_populacao)
        nova_populacao = gerar_nova_populacao(selecionados, tamanho_populacao, tx_crossover, tx_mutacao)
        populacao = nova_populacao
        epocas += 1

    fitness_populacao = fit_populacao(populacao, grupos, dataset)
    melhor_indice = elitismo(fitness_populacao)
    
    melhor_individuo = populacao[melhor_indice]
    grupo_novo_aluno = None
    for i in range(1, grupos + 1):
        grupo = sub_grupo(melhor_individuo, i)
        if len(grupo) > 0 and dataset.loc[grupo[-1], 'id_aluno'] == novo_aluno['id_aluno']:
            grupo_novo_aluno = grupo
            break
    
    if grupo_novo_aluno is not None:
        return jsonify({"grupo_novo_aluno": grupo_novo_aluno})
    else:
        return jsonify({"error": "Novo aluno não encontrado em nenhum grupo"}), 400

if __name__ == '__main__':
    app.run(debug=True)
