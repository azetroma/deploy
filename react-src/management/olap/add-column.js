/* eslint react/no-multi-comp: 0 */
/* eslint no-extra-parens: 0 */

import React from 'react';
import Axios from 'axios';
import CodeMirror from 'react-codemirror';
import { Dropdown, Button, Modal, TransitionablePortal } from 'semantic-ui-react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css'; // without this css hints won't show
import 'codemirror/addon/hint/show-hint';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/xml/xml';
import 'codemirror/addon/hint/sql-hint';
import 'codemirror/addon/hint/xml-hint';

export default class AddColumn extends React.Component {
    constructor(p) {
        super(p);
        this.state = {
            processProgress: false,
            error: null,
            formula: '',
            name: ''
        };

        this.list = p.data.Hierarchies.map(function (item) {
            return item.UniqueName;
        });
    }

    autoComplete = cm => {
        let codeMirror = this.refs['CodeMirror'].getCodeMirrorInstance();
        var list = this.list;
        codeMirror.registerHelper('hint', 'dictionaryHint', function (editor) {
            var cur = editor.getCursor();
            var curLine = editor.getLine(cur.line);
            var start = cur.ch;
            var end = start;
            while (end < curLine.length && /[\u0600-\u065F\u066A-\u06EF\u06FA-\u06FFa-zA-Z0-9$]/.test(curLine.charAt(end)))++end;
            while (start && /[\u0600-\u065F\u066A-\u06EF\u06FA-\u06FFa-zA-Z0-9$]/.test(curLine.charAt(start - 1)))--start;
            var curWord = curLine.slice(start, end);
            var regex = new RegExp('^.*' + curWord + '.*', 'i');
            console.log(regex);
            return {
                list: (list.filter(function (item) {
                    return item.match(regex);
                })).sort(),
                from: codeMirror.Pos(cur.line, start),
                to: codeMirror.Pos(cur.line, end)
            };
        });
        codeMirror.showHint(cm, codeMirror.hint.dictionaryHint, { completeSingle: false, container: $('.ui.modal').get(0) });
    };

    showError() {
        if (this.state.error)
            return <div className="ui red  segment">{this.state.error}</div>;
    }

    getFormula() {
        this.setState({ open: true, getInfoProgress: true });
        Axios
            .get(app.urlPrefix + 'api/olap/getCalculatedColumn/' + this.props.model.CalcId)
            .then(res => {
                this.setState({
                    id: this.props.model.CalcId,
                    name: res.data.name,
                    formula: res.data.formula,
                });
                this.setFormula(res.data.formula);
            })
            .catch(error => this.setState({ error: error.response.data.desc }))
            .finally(() => {
                this.setState({ getInfoProgress: false });
            });
    }

    setFormula(f) {
        let z = this.refs['CodeMirror'];
        if (z) {
            z.codeMirror.setValue(f);
        }
        this.setState({ formula: f });
    }

    addColumn() {
        if (this.props.model) {
            this.getFormula();
            return;
        }

        let names = this.props.data.Hierarchies.map((item) => {
            return item.Name;
        });

        let name = 'ستون جدید';
        let i = 1;
        while (_.indexOf(names, name) !== -1) {
            name = 'ستون جدید' + ' ' + i++;
        }

        this.setFormula('');
        this.setState({ open: true, name: name, id: 0, formula: '' });
    }

    updateCode(newCode) {
        this.setState({ formula: newCode });
    }

    delete() {
        var f = confirm('آیا برای حذف اطمینان دارید؟');
        if (!f) return;

        this.setState({ deleteProgress: true });
        Axios
            .get(app.urlPrefix + 'api/olap/deleteColumn/' + this.props.model.CalcId)
            .then(res => {
                var index = _.findIndex(this.props.data.Hierarchies, { 'CalcId': this.props.model.CalcId });
                this.props.data.Hierarchies.splice(index, 1);
                if (this.props.onchange) this.props.onchange();
                this.setState({ open: false });
            })
            .catch(error => this.setState({ error: error.response.data.desc }))
            .finally(() => {
                this.setState({ deleteProgress: false });
            });

    }

    save() { 
        this.setState({ saveProgress: true });
        Axios
            .post(app.urlPrefix + 'api/olap/addColumn', {
                id: this.state.id,
                name: this.state.name,
                formula: this.state.formula,
                datasourceId: this.props.data.UniqueName
            })
            .then(res => {
                if (!this.props.model) {
                    this.props.data.Hierarchies.push(res.data.hierarchy);
                } else {
                    var index = _.findIndex(this.props.data.Hierarchies, { 'CalcId': this.props.model.CalcId });
                    this.props.data.Hierarchies[index] = res.data.hierarchy ;
                }
                    if (this.props.onchange) this.props.onchange();
                    this.setState({ open: false, error: '' });
            })
            .catch(error => this.setState({ error: error.response.data.desc }))
            .finally(() => {
                this.setState({ saveProgress: false });
            });

    }

    renderModal() {
        var options = {
            lineNumbers: true,
            lineWrapping: true,
            mode: 'sql',
            extraKeys: {
                'Ctrl-Space': this.autoComplete
            }
        };

        return (
            <div> <style>{`
                        .CodeMirror-hints{
                            z-index:1000;
                            text-align:left;
                            direction: ltr;
                            font-family:IRANSans;
                            line-height:1.9em;
                        }
                          .ui.dimmer {
                            transition: background-color 0.4s ease;
                            background-color: transparent;
                          }

                          .modal-fade-in .ui.dimmer {
                            background-color: #00000099;
                          }
                     `}</style>

                <TransitionablePortal
                    open={this.state.open}
                    onOpen={() => setTimeout(() => document.body.classList.add('modal-fade-in'), 0)}
                    transition={{ animation: 'scale', duration: 500 }}>
                    <Modal open closeOnDimmerClick={false} closeOnDocumentClick={false} onClose={(event) => {
                        document.body.classList.remove('modal-fade-in');
                        this.setState(state => ({
                            open: false
                        }));
                    }}>
                        <Modal.Header>اضافه کردن ستون جدید</Modal.Header>
                        <Modal.Content scrolling>
                            <Modal.Description>
                                <div className="ui form">
                                    <div className={"field" + (this.props.model && this.props.data.modelType==1 ? ' disabled' : '')}>
                                        <label>نام ستون</label>
                                        <input value={this.state.name || ''} onChange={(e) => this.setState({ name: e.target.value })} />
                                    </div>
                                    <div className="field" >
                                        <label>فرمول</label>
                                        <div className="ltr" style={{ textAlign: 'left', border: '1px solid #efefef', borderRadius: '4px' }}>
                                            <CodeMirror ref="CodeMirror" className="ltr" value={this.state.formula || ''} onChange={(d) => this.updateCode(d)} options={options} />
                                        </div>
                                    </div>
                                    {this.showError()}
                                </div>
                            </Modal.Description>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button className="green" loading={this.state.saveProgress} disabled={this.state.saveProgress} onClick={() => this.save()}>ذخیره</Button>
                            <Button className="black" onClick={() => this.setState({ open: false })} >لغو</Button>
                            {this.props.model && <Button loading={this.state.deleteProgress} disabled={this.state.deleteProgress} className="red" onClick={() => this.delete()} >حذف</Button>}
                        </Modal.Actions>
                    </Modal>
                </TransitionablePortal>
            </div>);

    }

    
    render() {
        return (
            <div>
                <Dropdown icon='ellipsis vertical small link gray'>
                    <Dropdown.Menu>
                        <Dropdown.Item text={this.props.model ? 'ویرایش' : 'ستون جدید'} onClick={() => this.addColumn()} />
                        {this.props.model && <Dropdown.Item text='حذف' onClick={() => this.delete()} />}
                    </Dropdown.Menu>
                </Dropdown>

                {this.renderModal()}

            </div>
        );
    }
}