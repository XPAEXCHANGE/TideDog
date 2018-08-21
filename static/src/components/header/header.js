import React, { Component } from 'react';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { SCcontainer, SCrefreshContainer } from './style';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshTime: format(new Date(), 'YYYY-MM-DD hh:mm'),
            sync: false,
            animateTime: 2000 // 因為css 設定2000ms 轉一圈
        };

        this.handleRefreshTime = this.handleRefreshTime.bind(this);

        this.time = {
            start: 0, // 開始更新時間
            end: 0 // 更新結束時間
        };
    }

    componentDidUpdate(prevProps)
    {
        // fetching 資料中
        const { sync, animateTime } = this.state;
        if (sync)
        {
            // 利用prevProp跟目前的props去判斷觸發更新與更新結束
            const prev = prevProps.data.isLoading;
            const { data } = this.props;
            const current = data.isLoading;

            // 觸發更新
            if (!prev && current)
            {
                this.time.start = new Date() / 1;
            }

            // 更新結束
            if (prev && !current)
            {
                this.time.end = new Date() / 1;
            }

            const { start, end } = this.time;
            // 沒有整除的時間
            const remainTime = (end - start) % animateTime;

            if (start > 0 && end > 0 && (animateTime - remainTime > 0) && remainTime > 0)
            {
                // 需要再補上需要整除的時間
                setTimeout(() => {
                    this.setState(prevState => update(prevState, {
                        sync: { $set: false },
                        refreshTime: { $set: format(new Date(), 'YYYY-MM-DD hh:mm') },
                    }));
                }, (animateTime - remainTime));
            }
        }
    }

    handleRefreshTime()
    {
        const { methods } = this.props;
        const { sync } = this.state;
        if (!sync)
        {
            // 開始fetching資料判斷用
            methods.fetchListLoading();
            // 重新取資料
            methods.fetchList$();
            this.setState(prevState => update(prevState, {
                sync: { $set: true },
            }));
        }
    }

    renderRefreshTime()
    {
        const { refreshTime, sync } = this.state;
        const { data } = this.props;
        if (data.show)
        {
            return (
                <SCrefreshContainer>
                    <div className="refreshText">
                        {`${refreshTime} 最後更新`}
                    </div>
                    <div
                        className="refreshImg"
                        onClick={this.handleRefreshTime}
                    >
                        <img
                            src={sync ? '/asset/img/ic-refresh-hover.png' : '/asset/img/ic-refresh.png'}
                            alt="refresh"
                            className={sync ? 'sync' : ''}
                        />
                    </div>
                </SCrefreshContainer>
            );
        }
    }

    render()
    {
        return (
            <SCcontainer>
                <div>
                    <Link to="/tidedog">
                        <img
                            src="/asset/img/tidedog-logo.png"
                            alt="tidedog-logo"
                        />
                    </Link>

                    {this.renderRefreshTime()}
                </div>
            </SCcontainer>
        );
    }
}

Header.defaultProps = {
    data: {},
    methods: {}
};

Header.propTypes = {
    methods: PropTypes.object,
    data: PropTypes.object,
};

export default Header;
