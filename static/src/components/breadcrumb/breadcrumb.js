import React from 'react';
import { Link } from 'react-router-dom';

import { SCbreadcrumb } from './style';

const Breadcrunb = () => {
    return (
        <SCbreadcrumb>
            <Link to="/tidedog">
                交易列表
            </Link>
            ＞ 交易紀錄
        </SCbreadcrumb>
    );
};

export default Breadcrunb;
