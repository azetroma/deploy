/* eslint react/no-multi-comp: 0 */
/* eslint no-extra-parens: 0 */

import React from 'react';
import { Button, Icon, Menu, Modal, Form, TransitionablePortal } from 'semantic-ui-react';
import { post, get } from './utils/http';
import UploadFile from './utils/fileUpload';
import cssb from './utils/cssBeautify';
import { Dropdown } from 'semantic-ui-react';
import Axios from 'axios';

export default class UserVariablesDetail extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            counter: 0, model: {}, data: [],
            loadProgress: false,
            saveProgress: false,
            tab: { active: 'user' },
            userList: [],
            chartList: [],
            imagePreviewUrl: ''
        };
    }

    componentWillMount() {
        this.setState({ loadProgress: true });
    }

    componentDidMount() {
    }

    changeName() {
        this.setState({ saveProgress: true });
        Axios.get(app.urlPrefix + 'api/userVariables/rename/' + this.props.name + '?name=' + this.state.varName)
            .then(res => {
                window.location = app.hashUrlPrefix + '#/userVariables/' + this.state.varName;
            })
            .finally(e => {
                this.setState({ saveProgress: false, open: false });
            });
    }

    remove() {
        this.setState({ removeProgress: true });
        Axios.get(app.urlPrefix + 'api/userVariables/remove/' + this.props.name)
            .then(res => {
                window.location = app.hashUrlPrefix + '#/userVariables';
            })
            .finally(e => {
                this.setState({ removeProgress: false });
            });
    }

    renderModal() {
        return (

            <TransitionablePortal
                open={this.state.open}
                onOpen={() => setTimeout(() => document.body.classList.add('modal-fade-in'), 0)}
                transition={{ animation: 'scale', duration: 500 }}>
                <Modal open closeOnDimmerClick closeOnDocumentClick onClose={(event) => {
                    document.body.classList.remove('modal-fade-in');
                    this.setState(state => ({
                        open: false
                    }));
                }}>
                    <Modal.Header>ویرایش نام متغیر</Modal.Header>
                    <Modal.Content scrolling>
                        <Modal.Description>
                            <div className="ui form">
                                <div className="field">
                                    <label>نام متغیر</label>
                                    <input type="text" value={this.state.varName || this.props.name} onChange={e => this.setState({ varName: e.target.value })} />
                                </div>
                            </div>

                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button className="green" loading={this.state.saveProgress} disabled={this.state.saveProgress} onClick={() => this.changeName()}>ذخیره</Button>
                        <Button className="black" onClick={() => this.setState({ open: false })} >لغو</Button>
                    </Modal.Actions>
                </Modal>
            </TransitionablePortal>

        );
    }

    renderRemoveModal() {
        return (

            <TransitionablePortal
                open={this.state.openRemoveModal}
                onOpen={() => setTimeout(() => document.body.classList.add('modal-fade-in'), 0)}
                transition={{ animation: 'scale', duration: 500 }}>
                <Modal open closeOnDimmerClick closeOnDocumentClick onClose={(event) => {
                    document.body.classList.remove('modal-fade-in');
                    this.setState(state => ({
                        open: false
                    }));
                }}>
                    <Modal.Header>حذف متغیر</Modal.Header>
                    <Modal.Content scrolling>
                        <Modal.Description>
                            آیا برای حذف این متغیر اطمینان دارید؟
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button className="red" loading={this.state.removeProgress} disabled={this.state.removeProgress} onClick={() => this.remove()}>ذخیره</Button>
                        <Button className="black" onClick={() => this.setState({ openRemoveModal: false })} >لغو</Button>
                    </Modal.Actions>
                </Modal>
            </TransitionablePortal>

        );
    }

    renderUsers() {
        if (!this.state.userList.length && !this.state.callUsers) {

            Axios
                .get(app.urlPrefix + 'api/userVariables/get/' + this.props.name)
                .then(res => {
                    this.setState({ userList: res.data.keys });
                })
                .finally(e => this.setState({ callUsers: true }));
        }

        if (!this.state.userList.length && !this.state.callUsers)
            return <div className="ui active inline loader" />;

        return (
            <table className="ui table">
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}>#</th>
                        <th>کاربر</th>
                        <th>مقادیر متغیر</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.userList && this.state.userList.map((item, i) => {
                        return (
                            <tr key={i}>
                                <td>{persian(i + 1, true)}</td>
                                <td className="pointer" > <a href={app.hashUrlPrefix + '#/users/edit/' + item.Id}>{item.name} {item.Username}</a></td>
                                <td className="pointer" > {_.find(item.variables, { Key: this.props.name }).Value.join(', ')}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );

    }

    renderCharts() {
        if (!this.state.chartList.length && !this.state.callCharts) {
            Axios.get(app.urlPrefix + 'api/userVariables/getCharts/' + this.props.name)
                .then((res) => {
                    this.setState({
                        chartList: res.data.list, callCharts: true
                    });
                })
                .finally(e => this.setState({ callCharts: true }));
        }

        if (!this.state.chartList.length && !this.state.callCharts)
            return <div className="ui active inline loader" />;

        return (
            <table className="ui table">
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}>#</th>
                        <th>نمودار</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.chartList && this.state.chartList.map((item, i) => {
                        return (
                            <tr key={i}>
                                <td>{persian(i + 1, true)}</td>
                                <td className="pointer" > <a href={app.hashUrlPrefix + '#/charts/edit/0/' + item.id}>{item.name}</a></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );

    }

    render() {

        return (
            <div>
                <div className="ui header left floated">
                    لیست کاربران و نمودارهای مرتبط با متغیر
                    <b style={{ borderBottom: '1px dashed silver', padding: '0 10px', backgroundColor: '#efefef' }}> {this.props.name} </b>
                </div>

                <div className="ui mini basic icon buttons right floated" title="ویرایش نام">
                    <div className="ui icon button mini basic " onClick={e => this.setState({ open: true })}>
                        <i className="ui icon edit outline" />
                    </div>
                    <div className="ui icon button mini basic " onClick={e => this.setState({ openRemoveModal: true })} title="حذف متغیر">
                        <i className="ui icon trash alternate outline" />
                    </div>
                </div>

                <Segment active={this.state.tab.active} setActive={(d) => this.setState({ tab: { active: d } })} add={() => this.add()} >
                    {this.state.tab.active === 'user' && this.renderUsers()}
                    {this.state.tab.active === 'chart' && this.renderCharts()}
                </Segment>
                {this.renderModal()}
                {this.renderRemoveModal()}
            </div>
        );
    }
}

function TabItem(props) {
    return (
        <a onClick={() => props.setActive(props.name)} className={"item" + (props.name === props.active ? " active" : "")}>
            {props.children}
        </a>
    );
}

function Segment(props) {
    return (
        <div>
            <div className="ui top attached tabular menu" >
                <TabItem name="user" active={props.active} setActive={props.setActive}>کاربرها</TabItem>
                <TabItem name="chart" active={props.active} setActive={props.setActive} >نمودارها</TabItem>
            </div>
            <div className="ui bottom attached segment">
                {props.children}
            </div>
        </div>);
}


