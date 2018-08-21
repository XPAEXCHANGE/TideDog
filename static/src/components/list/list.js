import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { cutText } from '../../utils/helper';
import { SClist, SCstatus } from './style';

class List extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {};
    }

    renderStatus()
    {
        const { value } = this.props;
        let text;
        switch (value.rcpt_status)
        {
            case 'confirmed':
                text = '已上鏈';
                break;
            case 'failed':
                text = '交易失敗';
                break;
            case 'tracking':
                text = '偵聽中';
                break;
            default:
                text = '';
        }
        return (
            <SCstatus status={value.status}>
                {text}
            </SCstatus>
        );
    }

    render()
    {
        const { value } = this.props;
        return (
            <SClist>
                <Link to={`/record/${value.tx_hash}`}>
                    <div>
                        {cutText(value.tx_hash, 17)}
                    </div>
                    <div>
                        {value.block_num}
                    </div>
                    <div>
                        {value.time_onchain}
                    </div>
                    <div>
                        {cutText(value.addr_from, 17)}
                        <img src="/asset/img/ic-arrow.svg" alt="arrow" />
                    </div>
                    <div>
                        {cutText(value.addr_to, 17)}
                    </div>
                    <div>
                        {value.token_amount + value.symbol}
                    </div>
                    {this.renderStatus()}
                </Link>
            </SClist>
        );
    }
}

List.propTypes = {
    value: PropTypes.object.isRequired
};

export default List;
