import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Modal from "./Modal"; 
import {
  MainContent,
  Listas,
  Materiais,
  StyledImage,
  Main,
  MainItems,
  Titulo,
} from "./Turma.style";
import Carousel from "./Carousel";
import imageTest from "../assets/imgt.png";

function AlunoTurmaInscrito(props) {
  const { user, turma } = props;
  const [listas, setListas] = useState([]);
  const [refs, setRefs] = useState([]);
  const turmaId = turma.id;
  const [selectedRef, setSelectedRef] = useState(null); // Estado para a referência selecionada
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log("USER: ", user);
  console.log("TURMA: ", turma);

  useEffect(() => {
    const fetchListas = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8800/turma/${turma.id}/listas`
        );
        setListas(response.data.listas);
      } catch (error) {
        console.error("Erro ao buscar listas da turma:", error);
      }
    };

    const fetchRefs = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8800/aluno/turma/turmaRef/${turmaId}`
        );
        setRefs(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Erro ao buscar refs da turma:", error);
      }
    };

    fetchListas();
    fetchRefs();
  }, [turma.id]);

  const openModal = (refData) => {
    setSelectedRef(refData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRef(null);
  };

  return (
    <Main>
      <MainContent>
        <MainItems>
          <Listas>
            <Titulo>
              <div>
                <h5>Listas</h5>
              </div>
            </Titulo>
            <Carousel
              items={listas}
              renderItem={(lista) => (
                <div
                  onClick={() => props.handleSetFlagLista(true, lista, user)}
                >
                  <StyledImage src={imageTest} alt={lista.nome} />
                  <p>{lista.nome}</p>
                </div>
              )}
            />
          </Listas>

          <Materiais>
            <Titulo>
              <div>
                <h5>Referencias</h5>
              </div>
            </Titulo>
            <Carousel
              items={refs}
              renderItem={(ref) => (
                <div onClick={() => openModal(ref)}>
                  <StyledImage src={imageTest} alt={ref.ref} />
                  <p>{ref.tag}</p>
                  <p>{ref.formato}</p>
                </div>
              )}
            />
          </Materiais>
        </MainItems>
      </MainContent>
      <Modal isOpen={isModalOpen} onClose={closeModal} refData={selectedRef} />
    </Main>
  );
}

export default AlunoTurmaInscrito;
