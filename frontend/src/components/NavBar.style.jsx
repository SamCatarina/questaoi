import styled from "styled-components";

export const NavBarContainer = styled.nav`
  background-color: #3F3F3F;
  padding: 20px;
  width: 100vw;
  z-index: 3;
  position: fixed; 
  height:8vh;

`;

export const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const NavItem = styled.li`
  margin-right: 15px;
`;

export const NavLink = styled.a`
  text-decoration: none;
  color: #fff;
  &:hover {
    color: #ccc;
  }
`;

export const NavItens = styled.div`

  width: 30%;
  display: flex;
  justify-content: space-between;


`;
export const NavLogo = styled.div`
 img{
  width: 100px;
 }
  
`;