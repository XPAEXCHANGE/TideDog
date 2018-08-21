import styled from 'styled-components';

export const SClist = styled.li`
    padding: 23px 0 10px 16px;
    border-bottom: 1px solid #d8d8d8;
    min-width: 1124px;
    list-style: none;

    > a
    {
        text-decoration: none;
        display: flex;
        color: #4a4a4a;
    }
    
    div
    {
        flex: 1;
        min-width: 150px;

        &:first-child
        {
            color: #4a90e2;
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

        > img
        {
            float: right;
            margin-right: 9px;
        }
    }

    &.fade-enter
    {
        opacity: 0.01;
        background-color: #feffd2;
    }

    &.fade-enter.fade-enter-active
    {
        opacity: 1;
        transition: opacity 1000ms ease-out;
        background-color: #feffd2;
    }

    &.fade-enter-done
    {
        transition: background-color 1000ms ease-out;
        background-color: #fff;
    }
`;

export const SCstatus = styled.div`
    color: ${(props) => {
        switch (props.status)
        {
            case 'confirm':
                return '#6bb274';
            case 'pending':
                return '#ff8e50';
            case 'fail':
                return '#c3161c';
            default:
                return '#000';
        }
    }}
`;
