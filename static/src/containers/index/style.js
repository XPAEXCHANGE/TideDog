import styled from 'styled-components';

export const SCpageInfoContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30px 0;

    @media (max-width: 768px)
    {
        flex-direction: column;
    }

    > .info
    {
        color: #4a4a4a;
        font-weight: 300;
        font-size: 0.875rem;

        @media (max-width: 768px)
        {
            padding-bottom: 22px;
        }

        .num
        {
            font-weight: 500;
            margin-right: 5px;
        }

        .text
        {
            font-weight: 300;
            margin-right: 5px;
        }
    }
`;


export const SCcontainer = styled.div`
    border-radius: 12.5px;
    padding: 30px;
    background-color: #fff;
    flex: 1;
    overflow-x: scroll;
`;

export const SCtitle = styled.div`
    font-size: 1rem;
    background-color: #f6f6f6;
    display: flex;
    padding: 8px 16px;
    padding-right: 0;
    border: 1px solid #d8d8d8;
    border-left: 0;
    border-right: 0;
    min-width: 1124px;

    > div
    {
        flex: 1;
        min-width: 150px;

        &:first-child
        {
            min-width: 175px;
        }

        &:nth-child(4)
        {
            min-width: 190px;
        }

        &:nth-child(5)
        {
            min-width: 175px;
        }
    }
`;

export const SCcontent = styled.ul`
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
`;


export const SCborder = styled.div`
    border-radius: 12.5px;
    overflow: hidden;
    @media (max-width: 1200px)
    {
        border: solid 1px #979797;
    }
`;
