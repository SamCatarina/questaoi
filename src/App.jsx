import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Importa o componente Routes

import Hero from './components/Hero';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import NavBar from './components/NavBar';
import Turma from './components/Turma';
import NewList from './components/NewList'

function App() {
    return (
        <Router>
            <NavBar />
            <Routes> 
                <Route path="/login" element={<Login />} /> 
                <Route path="/cadastro" element={<Cadastro />} /> 
                <Route path="/turma" element={<Turma />} /> 
                <Route path="/novalista" element={<NewList />} /> 
                <Route path="/" element={<Hero />} /> 
            </Routes>
        </Router>
    );
}

export default App;
