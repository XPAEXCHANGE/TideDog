import styled from 'styled-components';

export const SCcontainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;

    button:nth-of-type(2n+2)
    {
        margin-left: 5px;
    }

    .pageText
    {
        padding: 0 15px;
        font-size: 0.875rem;
        font-weight: 500;
    }
`;
