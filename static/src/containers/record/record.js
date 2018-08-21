import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { fetchRecord$, fetchRecordCancel$, emptyRecord } from '../../actions/tideDog';
import Header from '../../components/header/header';
import Breadcrumb from '../../components/breadcrumb/breadcrumb';
import {
    SCcard, SChead, SCsection, SCfieldContainer, SClabel, SCfield, SCfieldRectangle
} from './style';
import { WGcontainer } from '../../widgets/container';

function mapStateToProps(state)
{
    return {
        record: state.tideDog.record
    };
}

function mapDispatchToProps(dispatch)
{
    return {
        fetchRecord$: bindActionCreators(fetchRecord$, dispatch),
        fetchRecordCancel$: bindActionCreators(fetchRecordCancel$, dispatch),
        emptyRecord: bindActionCreators(emptyRecord, dispatch),
    };
}

class Record extends React.Component
{
    constructor(props, context)
    {
        super(props, context);
        this.state = {};
    }

    componentDidMount()
    {
        const { fetchRecord$, match } = this.props;
        fetchRecord$(match.params.txHash);
    }

    componentWillUnmount()
    {
        const { fetchRecordCancel$, emptyRecord } = this.props;
        fetchRecordCancel$();
        emptyRecord();
    }

    render()
    {
        const { record } = this.props;
        let status = null;
        if (record.rcpt_status === 0)
        {
            status = (
                <SCfield color="#c3161c">
                    交易失敗
                </SCfield>
            );
        }
        else if (record.rcpt_status === 1)
        {
            status = (
                <SCfield color="#6bb274">
                    已上鏈
                </SCfield>
            );
        }
        else if (record.rcpt_status === 2)
        {
            status = (
                <SCfield color="#f96332">
                    偵聽中
                </SCfield>
            );
        }

        return (
            <div>
                <Header data={{ show: false }} />
                <WGcontainer>
                    <Breadcrumb />
                    <SCcard>
                        <SChead>
                            <div>
                                TxHash
                            </div>
                            <div>
                                {record.tx_hash}
                            </div>
                        </SChead>

                        <SCsection>

                            <SCfieldContainer>
                                <SClabel>
                                    TxReceipt Status：
                                </SClabel>
                                {status}
                            </SCfieldContainer>

                            <SCfieldContainer>
                                <SClabel>
                                    Block Height：
                                </SClabel>
                                <SCfield>
                                    {record.block_num}
                                </SCfield>
                            </SCfieldContainer>

                            <SCfieldContainer>
                                <SClabel>
                                    TimeStamp：
                                </SClabel>
                                <SCfield>
                                    {record.block_timestamp}
                                </SCfield>
                            </SCfieldContainer>

                            <SCfieldContainer>
                                <SClabel>
                                    From：
                                </SClabel>
                                <SCfield>
                                    {record.addr_from}
                                </SCfield>
                            </SCfieldContainer>

                            <SCfieldContainer>
                                <SClabel>
                                    To：
                                </SClabel>
                                <SCfield>
                                    {record.addr_to}
                                </SCfield>
                            </SCfieldContainer>

                            <SCfieldContainer>
                                <SClabel>
                                    Token Transfered：
                                </SClabel>
                                <SCfield>
                                    <div>
                                        <span>
                                            From
                                        </span>
                                        <span>
                                            {record.addr_from}
                                        </span>
                                    </div>

                                    <div>
                                        <span>
                                            To
                                        </span>
                                        <span>
                                            {record.addr_to_inner}
                                        </span>
                                    </div>

                                    <div>
                                        <span>
                                            For
                                        </span>
                                        <span>
                                            {record.token_amount && parseInt(record.token_amount, 16) / (10 ** 18)}
                                            {' '}
                                            {record.token_symbol}
                                        </span>
                                    </div>

                                </SCfield>
                            </SCfieldContainer>

                            <SCfieldContainer>
                                <SClabel>
                                    Value：
                                </SClabel>
                                <SCfield>
                                    { record.coin_amount && record.coin_amount / (10 ** 18)}
                                    {' '}
                                    Ether
                                </SCfield>
                            </SCfieldContainer>

                        </SCsection>

                        <SCsection>
                            <SCfieldContainer>
                                <SClabel>
                                    Gas Limit：
                                </SClabel>
                                <SCfield>
                                    {record.gas}
                                </SCfield>
                            </SCfieldContainer>

                            <SCfieldContainer>
                                <SClabel>
                                    Gas Price：
                                </SClabel>
                                <SCfield>
                                    {/* 0.000000079125 Ether (79.125 Gwei) */}
                                    {record.gas_price && (record.gas_price / (10 ** 18)).toFixed(9)}
                                    {' Ether ('}
                                    {record.gas_price && (record.gas_price / (10 ** 9)).toFixed(3)}
                                    {' Gwei)'}
                                </SCfield>
                            </SCfieldContainer>

                            <SCfieldContainer>
                                <SClabel>
                                    Gas Used By Txn：
                                </SClabel>
                                <SCfield>
                                    {record.gas_used}
                                </SCfield>
                            </SCfieldContainer>

                            <SCfieldContainer>
                                <SClabel>
                                    Actual Tx Coast / Fee：
                                </SClabel>
                                <SCfield>
                                    {/* 0.001661625 Ether */}
                                    {`${record.tx_fee ? (record.tx_fee / (10 ** 18)).toFixed(9) : ''} Ether`}
                                </SCfield>
                            </SCfieldContainer>
                        </SCsection>

                        <SCsection>
                            <SCfieldContainer>
                                <SClabel>
                                    {'Nonce & {Position}：'}
                                </SClabel>
                                <SCfield>
                                    {/* {'142 | {103} (Also found 1 other dropped Txn #1 with the same `from` account nonce)'} */}
                                    {`${record.nonce ? record.nonce : ''} | {${(record.tx_index || record.tx_index === 0) ? record.tx_index : ''}}`}
                                </SCfield>
                            </SCfieldContainer>

                            <SCfieldContainer>
                                <SClabel>
                                    Input Data：
                                </SClabel>
                                <SCfieldRectangle>
                                    {record.tx_input}
                                </SCfieldRectangle>
                            </SCfieldContainer>

                        </SCsection>
                    </SCcard>
                </WGcontainer>
            </div>
        );
    }
}

Record.propTypes = {
    fetchRecord$: PropTypes.func.isRequired,
    fetchRecordCancel$: PropTypes.func.isRequired,
    emptyRecord: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Record);
