import styled from 'styled-components';

export const SCcard = styled.div`
    border-radius: 12.5px;
    background-color: #ffffff;

    padding: 45px 50px 0;

    font-size: 1rem;
    color: #4a4a4a;
    margin-bottom: 70px !important;
    box-sizing: border-box;

    @media (max-width: 768px)
    {
        padding: 30px 20px 50px;
    }
`;

export const SChead = styled.div`
    display: flex;

    align-items: center;
    flex-wrap: wrap;

    background-color: #f7f7f7;
    border: solid #979797;
    border-width: 1px 0;

    padding: 15px 12px 12px;

    word-break: break-all;

    > div:first-child
    {
        margin-right: 50px;
        font-size: 1.125rem;
        font-weight: 500;
        color: #000;
    }


    @media (max-width: 768px)
    {
        padding: 15px 9px 16px;

        > div:first-child
        {
            width: 100%;
            margin-bottom: 10px;
        }
    }
`;

export const SCsection = styled.div`
    border: solid #dbdbdb;
    border-width: 0 0 1px;

    padding-top: 31px;

    &:last-child
    {
        border-color: transparent;
    }
`;

export const SCfieldContainer = styled.div`
    display: flex;
    flex-wrap: wrap;

    margin-bottom: 33px;
`;

export const SClabel = styled.label`
    color: #000;
    width: 184px;
    text-align: right;
    font-weight: 500;

    @media (max-width: 768px)
    {
        text-align: left;
        width: 100%;

        margin-bottom: 10px;
    }
`;

export const SCfield = styled.div`
    margin-left: 30px;

    word-break: break-all;

    ${({ color }) => (color ? 'color: #f96332' : '')};

    > div
    {
        display: flex;
        margin-bottom: 5px;

        span:first-child
        {
            width: 59px;
        }
    }

    @media (max-width: 768px)
    {
        margin-left: 0;
    }
`;

export const SCfieldRectangle = styled.div`
    margin-left: 30px;

    word-break: break-all;

    flex: 1;

    max-width: 780px;
    height: 168px;

    padding: 11px 14px;

    border-radius: 4px;
    background-color: #f4f4f4;
    border: solid 1px #c6c6c6;

    height: auto;

    @media (max-width: 768px)
    {
        margin-left: 0;
    }
`;
