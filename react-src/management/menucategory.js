import React from 'react';
import { Button, Icon, Menu, Modal, TransitionablePortal } from 'semantic-ui-react';
import Axios from 'axios';
import { Dropdown } from 'semantic-ui-react';
import update from 'immutability-helper';
import notify from './utils/notify';
notify.config();

export default class MenuCategoryManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            model: {}
        };
    }
    componentWillMount() {
        this.setState({ loadProgress: true });
    }


    componentDidMount() {
        Axios.get(app.urlPrefix + 'api/menucategories/get')
            .then(res => this.setState({ data: res.data.list, loadProgress: false }))
            .catch(e => this.setState({ loadProgress: false }));

        Axios.get(app.urlPrefix + 'api/mainmenus/getAll')
            .then(res => {
                this.apps = res.data.list.map(i => { return { text: i.name, value: i.id }; });
            })
            .catch(e => { });
    }

    apps = []

    save() {
        this.setState({ saveProgress: true });
        Axios.post(app.urlPrefix + 'api/menucategories/save', this.state.model)
            .then(res => {
                
                if (this.state.model.id > 0) {
                    let index = _.findIndex(this.state.data, { id: this.state.model.id });
                    let newState = update(this.state, {
                        data: {
                            [index]: {
                                $set: res.data
                            }
                        }
                    });
                    this.setState(newState);
                } else {
                    let newState = update(this.state, {
                        data: {
                            $splice: [[99999999, 0, res.data]]
                        }
                    });
                    console.log('### newState',newState
                    );
                    this.setState(newState);
                }
                this.setState({ open: false });
                notify.notify();
            })
            .catch(e => {
                notify.notifyError();
            }).finally(e => {
                this.setState({ saveProgress: false });
            });
    }

    edit(item) {
        this.setState({ model: item, open: true });
    }

    newMenu() {
        this.setState({ model: { name: null, appId: 0, id: 0 }, open: true });
    }

    delete(item) {
        var f = confirm('آیا برای حذف اطمینان دارید؟');
        if (!f) return;

        Axios.post(app.urlPrefix + 'api/menucategories/delete/' + item.id).then(() => {
            let list = [...this.state.data];
            let index = _.findIndex(list, { id: item.id });
            if (index >= 0) {
                list.splice(index, 1);
                this.setState({ data: list });
            }
        });
    }

    newTheme() {
        this.setState({ open: true, model: this.getDefaultModel() });
    }

    renderModal() {
        return (
            <TransitionablePortal
                open={this.state.open}
                onOpen={() => setTimeout(() => document.body.classList.add('modal-fade-in'), 0)}
                transition={{ animation: 'scale', duration: 500 }}>
                <Modal open={true} closeOnDimmerClick closeOnDocumentClick onClose={(event) => {
                    document.body.classList.remove('modal-fade-in');
                    this.setState(state => ({
                        open: false
                    }));
                }}>
                    <Modal.Header>ویرایش</Modal.Header>
                    <Modal.Content >
                        <Modal.Description>
                            <div className="ui form">
                                <div className="field">
                                    <label>نام گروه منو</label>
                                    <input value={this.state.model.name || ''} onChange={e => this.setState({ model: { ...this.state.model, name: e.target.value } })} />
                                </div>
                                <div className="field">
                                    <label>پروژه</label>
                                    <Dropdown placeholder='پروژه' fluid selection
                                        options={this.apps}
                                        value={this.state.model.appId}
                                        onChange={(e, d) => this.setState({ model: { ...this.state.model, appId: d.value } })}
                                    />
                                </div>
                            </div>

                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button className="green" loading={this.state.saveProgress} disabled={this.state.saveProgress} onClick={() => this.save()}>ذخیره</Button>
                        <Button className="black" onClick={() => this.setState({ open: false })} >لغو</Button>
                    </Modal.Actions>
                </Modal>
            </TransitionablePortal>
        );
    }

    render() {

        return (
            <div>

                <style>{`
                          .ui.dimmer {
                            transition: background-color 0.4s ease;
                            background-color: transparent;
                          }

                          .modal-fade-in .ui.dimmer {
                            background-color: #00000099;
                          }
                     `}</style>
                <Menu pointing secondary>
                    <Menu.Item active name="لیست گروه‌های منو" />
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Button className="mini compact" onClick={() => this.newMenu()}> <Icon name="add" />اضافه کردن</Button>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>

                <table className="ui table">
                    <thead><tr><th style={{ width: '50px' }}>#</th><th>نام</th><th style={{ width: '100px' }} /></tr></thead>
                    <tbody>
                        {this.state.data && this.state.data.map((item, i) => {
                            return (
                                <tr key={item.id}>
                                    <td>{persian(i + 1, true)}</td>
                                    <td className="pointer" onClick={() => this.edit(item)}>{item.name}</td>
                                    <td style={{ textAlign: 'left' }}> <div className="ui mini basic icon button" onClick={() => this.delete(item)}><Icon name="alternate trash outline" /></div></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {this.state.loadProgress && <div className="ui active inline centered loader" />}
                {(!this.state.data || !this.state.data.length) && !this.state.loadProgress && <div><small>داده‌ای برای نمایش وجود ندارد</small></div>}


                {this.renderModal()}

            </div>
        );
    }
}


