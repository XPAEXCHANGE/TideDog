import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { WGpageButton } from '../../widgets/button';
import { SCcontainer } from './style';


class Pagination extends Component {
    constructor(props)
    {
        super(props);
        this.state = {};
    }

    render() {
        const { total, current, methods } = this.props;
        const { handlePage } = methods;
        return (
            <SCcontainer>
                <WGpageButton type="default" onClick={() => handlePage('first')}>
                    First
                </WGpageButton>
                <WGpageButton type="default" onClick={() => handlePage('prev')}>
                    Prev
                </WGpageButton>
                <span className="pageText">
                    {`Page ${current} of ${total}`}
                </span>
                <WGpageButton type="default" onClick={() => handlePage('next')}>
                    Next
                </WGpageButton>
                <WGpageButton type="default" onClick={() => handlePage('last')}>
                    Last
                </WGpageButton>
            </SCcontainer>
        );
    }
}

Pagination.defaultProps = {
    total: 0,
    current: 0,
};

Pagination.propTypes = {
    total: PropTypes.number,
    current: PropTypes.number,
    methods: PropTypes.object.isRequired,
};

export default Pagination;
