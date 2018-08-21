import styled from 'styled-components';

export const WGcontainer = styled.div`
    background-color: #f4f4f4;
    width: 100%;
    min-height: calc(100vh - 100px);

    ${({ bgColor }) => {
        if (bgColor)
        {
            return `
                background-color: ${bgColor};
            `;
        }
    }};

    > div
    {
        max-width: 1200px;
        margin: 0 auto;

        @media (max-width: 1200px)
        {
            width: 90%;
        }
    }
`;
