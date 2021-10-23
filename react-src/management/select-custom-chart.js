import React from 'react';
import Axios from 'axios';
import service from './service-custom-charts';
import { Accordion, Checkbox, Dropdown, Modal } from 'semantic-ui-react';

export default class CustomChartSelector extends React.Component {
    state = {}

    componentDidMount() {
        this.getList().then(res => {
            this.setState({ charts: res.list });
        });
    }

    getList() {
        return service.get().then(res => {
            _.sortBy(res.list, "category");
            return res;
        });
    }

    check(chart) {
        this.getList();
        chart.check = !chart.check;
        _.each(this.state.charts, item => {
            if (item.id !== chart.id) item.check = false;
        });
        this.update();
    }

    getCheched = (roles, selected) => {
        _.each(roles, role => {
            if (role.check) selected.push(role);
        });
    }

    update() {
        this.setState({ charts: this.state.charts });
    }

    renderChart(roles) {
        if (!roles) return null;
        return roles.map(chart => {
            return (
                <div key={chart.id} className="" ref={e => chart.el = e} style={{ padding: '5px 0px' }} >
                    <Checkbox label={chart.name} checked={chart.check} onChange={e => this.check(chart)} /> <div className="ui mini label">{chart.category}</div>
                </div>
            );
        });
    }

    submit() {
        let selected = [];
        this.getCheched(this.state.charts, selected);
        if (this.props.onChange) { this.props.onChange(selected); }
    }

    render() {
        return (
            <div>
                <Modal open={this.props.open} closeOnEscape closeOnDimmerClick>
                    <Modal.Header>
                        انتخاب نمودار دلخواه
                    </Modal.Header>
                    <Modal.Content>
                        {this.renderChart(this.state.charts)}
                    </Modal.Content>
                    <Modal.Actions>
                        <div className="ui button blue" onClick={e => this.submit()}> انتخاب</div>
                    </Modal.Actions>
                </Modal>
            </div>
        );
    }

}