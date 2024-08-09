import styled from 'styled-components';

export const TagSuggestionsContainer = styled.div`
  max-height: 15px; /* Limita a altura da lista de opções */
  overflow-y: auto;  /* Adiciona barra de rolagem se necessário */
  border: 1px solid #ccc;
  background-color: white;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  padding: 0.5em;
  position: absolute;
  width: 10%;
  z-index: 1000;
`;

export const StyledInput = styled.input`
  width: 100%;
  box-sizing: border-box;
`;
