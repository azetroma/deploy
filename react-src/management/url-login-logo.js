import React from 'react';
import { Button, Icon, Menu, Modal, Form, TransitionablePortal } from 'semantic-ui-react';
//import { post, get } from './utils/http';
import UploadFile from './utils/fileUpload';
import cssb from './utils/cssBeautify';
import Axios from 'axios';

export default class LoginPageLogo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            counter: 0, model: {}, data: [],
            loadProgress: false,
            saveProgress: false,
            imagePreviewUrl: ''
        };
    }

    componentWillMount() {
        this.setState({ loadProgress: true });
    }

    componentDidMount() {
        Axios.get(app.urlPrefix + 'api/LoginPageLogo/get')
            .then(data => {
                this.setState({ data: data.data.list });
            })
            .finally(()=> {
                this.setState({ loadProgress: false });
            });
    }

    setModel(key, val) {
        this.setState(prv => {
            var model = prv.model;
            model[key] = val;
            return {
                model: model
            };
        });
    }

    save() {
        this.setState({ saveProgress: true });

        var data = this.state.model;
        if (data.extraCss) {
            data.extraCss = cssb(this.state.model.extraCss, {
                indent: '    ',
                autosemicolon: true
            });
        }
        var link = app.urlPrefix + 'api/LoginPageLogo/save';
        Axios.post(link, data)
            .then(res => {
                let data = res.data;
                if (!this.state.model.id) {
                    let list = [...this.state.data];
                    list.push(data);
                    this.setState({ data: list });
                }

                let list = [...this.state.data];
                var index = _.findIndex(list, { id: data.id });
                if (index >= 0) {
                    list.splice(index, 1, data);
                    this.setState({ data: list });
                }

                this.setState({ saveProgress: false, open: false });
            })
            .catch((e) => {
                this.setState({ saveProgress: false });
                alert('خطا در ارتباط با سرور');
            });
    }

    edit(item) {
        this.setState({ model: item, open: true });
    }

    delete(item) {
        var f = confirm('آیا برای حذف اطمینان دارید؟');
        if (!f) return;

        Axios.post(app.urlPrefix + 'api/LoginPageLogo/delete/' + item.id).then(() => {
            let list = [...this.state.data];
            let index = _.findIndex(list, { id: item.id });
            if (index >= 0) {
                list.splice(index, 1);
                this.setState({ data: list });
            }
        });
    }

    newTheme() {
        this.setState({ open: true, model: {} });
    }

    upload(data) {
        this.setState({
            model: {
                ...this.state.model,
                logo: data
            }
        });
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
                    <Modal.Header>ویرایش </Modal.Header>
                    <Modal.Content scrolling>
                        <Modal.Description>
                            <Form>
                                <Form.Field>
                                    <label>آدرس دامنه</label>
                                    <input placeholder='آدرس دامنه' value={this.state.model.name || ''} onChange={(e) => { this.setModel('name', e.target.value); }} />
                                    <small>آدرس دامنه‌ای که قرار است لوگوی انتخابی برای آن آدرس نمایش داده شود</small>
                                </Form.Field>
                                 <div className="field">
                                    <UploadFile pic={this.state.model.logo} text="انتخاب لوگو" onChange={(d) => this.upload(d)} />
                                </div>
                                <div>
                                    {this.state.model.logoId && !this.state.model.logo ?
                                        <img width="100" src={app.urlPrefix + 'api/upload/getPic/' + this.state.model.logoId} style={{ margin: '0 auto', display: 'block' }} /> : ''}
                                </div>
                                <div className="field">
                                    <label>متن صفحه ورود</label>
                                    <textarea value={this.state.model.loginText || ''} onChange={(e) => this.setModel('loginText', e.target.value)} />
                                </div>
                            </Form>
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
                    <Menu.Item active name="لیست لوگوها" />
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Button className="mini compact" onClick={() => this.newTheme()}> <Icon name="add" /> اضافه کردن</Button>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>

                <table className="ui table">
                    <thead><tr><th style={{ width: '50px' }}>#</th><th>لینک</th><th style={{ width: '100px' }} /></tr></thead>
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
                {!this.state.data.length && !this.state.loadProgress && <div><small>داده‌ای برای نمایش وجود ندارد</small></div>}


                {this.renderModal()}

            </div>
        );
    }
}


