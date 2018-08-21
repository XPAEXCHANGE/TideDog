import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { fetchList$, fetchListCancel$, fetchListLoading } from '../../actions/tideDog';
import Header from '../../components/header/header';
import { WGcontainer } from '../../widgets/container';
import Pagination from '../../components/pagination/pagination';
import List from '../../components/list/list';
import { calcTime } from '../../utils/helper';
import {
    SCpageInfoContainer, SCcontainer, SCtitle, SCcontent, SCborder
} from './style';


function mapStateToProps(state)
{
    return {
        lists: state.tideDog.lists.data,
        totalCount: state.tideDog.lists.counts,
        totalPages: state.tideDog.lists.totalPages,
        isLoading: state.tideDog.lists.isLoading
    };
}

function mapDispatchToProps(dispatch)
{
    return {
        fetchList$: bindActionCreators(fetchList$, dispatch),
        fetchListCancel$: bindActionCreators(fetchListCancel$, dispatch),
        fetchListLoading: bindActionCreators(fetchListLoading, dispatch),
    };
}

class Index extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            currentPage: 1,
            perPage: 15
        };

        this.title = [
            'TxHash',
            'Block',
            'Age',
            'From',
            'To',
            'Value',
            'Status'
        ];

        this.handlePage = this.handlePage.bind(this);
    }

    componentDidMount()
    {
        // const { fetchList$ } = this.props;
        const { lists, fetchList$ } = this.props;
        if (lists.length > 0) return;
        fetchList$();
    }

    componentWillUnmount()
    {
        this.props.fetchListCancel$();
    }

    // 分頁按鈕
    handlePage(type)
    {
        const { currentPage } = this.state;
        let { totalPages } = this.props;
        let newPageIndex = 0;

        switch (type)
        {
            case 'first':
                if (currentPage !== 1)
                {
                    newPageIndex = 1;
                }
                break;
            case 'prev':
                if (currentPage !== 1)
                {
                    newPageIndex = currentPage - 1;
                }
                break;
            case 'next':
                if (currentPage !== totalPages)
                {
                    newPageIndex = currentPage + 1;
                }
                break;
            case 'last':
                if (currentPage !== totalPages)
                {
                    newPageIndex = totalPages;
                }
                break;
            default:
                break;
        }

        if (currentPage !== newPageIndex && newPageIndex !== 0)
        {
            // 更新目前頁碼
            this.setState(prevState => update(prevState, {
                currentPage: { $set: newPageIndex },
            }));
        }
    }

    renderTitle()
    {
        return this.title.map(t => (
            <div key={t}>
                {t}
            </div>));
    }

    renderList()
    {
        const { lists } = this.props;
        const { currentPage, perPage } = this.state;

        let startIndex = (currentPage - 1) * perPage;
        let endIndex = currentPage * perPage;

        return lists.slice(startIndex, endIndex).map(list => (
            <CSSTransition
                classNames="fade"
                appear={true}
                timeout={{ enter: 0, exit: 0 }}
                key={list.tx_hash}
            >
                <List
                    value={{
                        ...list,
                        age: calcTime(Math.floor((Date.now() - list.age) / 1000)),
                    }}
                />
            </CSSTransition>
        ));
    }

    renderInfo()
    {
        const { lists } = this.props;

        // 解析資料，rcpt_status: confirmed（已確認）、tracking（偵聽中）
        let confirmed = 0;
        let tracking = 0;

        // 計算已確認與偵聽中數量
        for (let idx in lists)
        {
            if (lists[idx].rcpt_status === 'confirmed')
            {
                confirmed += 1;
            }
            else if (lists[idx].rcpt_status === 'tracking')
            {
                tracking += 1;
            }
        }

        return (
            <div className="info">
                <span className="num">
                    {tracking}
                </span>
                <span className="text">
                    筆偵聽中 /
                </span>
                <span className="num">
                    {confirmed}
                </span>
                <span className="text">
                    筆已上鏈
                </span>
            </div>
        );
    }

    render()
    {
        const { currentPage } = this.state;
        const {
            totalPages,
            fetchList$,
            isLoading,
            fetchListLoading
        } = this.props;
        return (
            <div>
                <Header methods={{ fetchList$, fetchListLoading }} data={{ isLoading, show: true }} />
                <WGcontainer>
                    <div>
                        <SCpageInfoContainer>
                            {this.renderInfo()}
                            <Pagination
                                total={totalPages}
                                current={currentPage}
                                methods={{
                                    handlePage: this.handlePage,
                                }}
                            />
                        </SCpageInfoContainer>
                        <SCborder>
                            <SCcontainer>
                                <SCtitle>
                                    {this.renderTitle()}
                                </SCtitle>
                                <SCcontent>
                                    <TransitionGroup>
                                        {this.renderList()}
                                    </TransitionGroup>
                                </SCcontent>
                            </SCcontainer>
                        </SCborder>
                        <SCpageInfoContainer>
                            <div />
                            <Pagination
                                total={totalPages}
                                current={currentPage}
                                methods={{
                                    handlePage: this.handlePage
                                }}
                            />
                        </SCpageInfoContainer>
                    </div>
                </WGcontainer>
            </div>
        );
    }
}

Index.defaultProps = {
    totalPages: 1,
    isLoading: false
};

Index.propTypes = {
    fetchList$: PropTypes.func.isRequired,
    fetchListCancel$: PropTypes.func.isRequired,
    fetchListLoading: PropTypes.func.isRequired,
    lists: PropTypes.array.isRequired,
    totalPages: PropTypes.number,
    isLoading: PropTypes.bool
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
