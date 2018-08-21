import styled from 'styled-components';

export const WGpageButton = styled.button`
    padding: 3px 13px;
    border-radius: 12.5px;
    outline: 0;
    cursor: pointer;
    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.14);
    color: #fff;
    font-size: 0.875rem;
    border: 0;

    ${({ type }) => {
        switch (type)
        {
            case 'default':
                return 'background-color: #5dade3';
            default:
                return 'background-color: #5dade3';
        }
    }};

    &:hover
    {
        background-color: #015aa3;
        transition: .5s;
    }
`;
