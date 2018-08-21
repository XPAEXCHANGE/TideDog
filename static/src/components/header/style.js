import styled from 'styled-components';
import { WGcontainer } from '../../widgets/container';

export const SCcontainer = WGcontainer.extend`
    background-color: #fff;
    height: 100px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.06);
    position: relative;
    min-height: auto;

    > div
    {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;

        @media (max-width: 1200px)
        {
            width: 90%;
        }

        a
        {
            img
            {
                @media (max-width: 768px)
                {
                    width: 116px;
                }
            }
        }
    }
`;

export const SCrefreshContainer = styled.div`
    display: flex;
    align-items: center;

    > .refreshText
    {
        margin-right: 14px;
        color: #4a4a4a;
        font-size: 1rem;
        @media (max-width: 768px)
        {
            margin-right: 8px;
            font-size: 0.875rem;
        }
    }

    > .refreshImg
    {
        display: flex;
        align-items: center;
        cursor: pointer;
        img
        {
            transform-origin: 44% 50%;

            &.sync
            {
                animation: spin 2s linear infinite;
            }

            @keyframes spin
            {
                0%
                {
                    transform: rotate(0);
                }
                100%
                {
                    transform: rotate(360deg);
                }
            }
        }
    }
`;
