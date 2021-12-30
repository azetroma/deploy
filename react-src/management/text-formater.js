import React from 'react';
import { Button, Popup, Dropdown } from 'semantic-ui-react';
import ColorPicker from './colorPicker';

export default class TextFormatter extends React.Component {
    constructor(props) {
        super(props);
    }

    change(t, v) {
        console.log(t, v);
        let newProps = _.merge({}, this.props.model);

        if (t === 'bold' || t === 'italic') {
            newProps[t] = !newProps[t];
        } else {
            newProps[t] = v;
        }

        if (this.props.onChange) {
            this.props.onChange(newProps);
        }
    }

    renderForm() {
        return (
            <div className="ui mini form">

                <div className="inline field" >
                    <label>حالت نوشته</label>
                    <div className="ui mini icon buttons">
                        <button ng-class="{active: model.bold}" ng-click="model.bold = !model.bold; onChange();" className="ui button"><i className="bold icon" /></button>
                        <button ng-class="{active: model.italic}" ng-click="model.italic = !model.italic; onChange();" className="ui button"><i className="italic icon" /></button>
                    </div>
                </div>

                <div className="inline field" >
                    <label>align</label>

                    <div className="ui mini icon buttons">
                        <button ng-class="{active: model.align==='right'}" ng-click="model.align = 'right'; onChange();" className="ui button"><i className="align right icon" /></button>
                        <button ng-class="{active: model.align==='center'}" ng-click="model.align = 'center'; onChange();" className="ui button"><i className="align center icon" /></button>
                        <button ng-class="{active: model.align==='left'}" ng-click="model.align = 'left'; onChange();" className="ui button"><i className="align left icon" /></button>
                    </div>
                </div>
                {
                    //<div className="inline field" >
                    //    <label>align</label>
                    //    <Dropdown
                    //        inline scrolling
                    //        options={[
                    //            { key: '8', text: '8', value: '8px' },
                    //            { key: '9', text: '9', value: '9px' },
                    //            { key: '10', text: '10', value: '10px' },
                    //            { key: '12', text: '12', value: '12px' },
                    //            { key: '13', text: '13', value: '13px' },
                    //            { key: '14', text: '14', value: '14px' },
                    //            { key: '15', text: '15', value: '15px' }
                    //        ]}
                    //        defaultValue={'14'}
                    //    />
                    //</div>
                }


                <div className="inline field" >
                    <label>اندازه نوشته</label>

                    <select className="btn btn-xs" ng-model="model.fontSize" >
                        <option value="8px">8</option>
                        <option value="9px">9</option>
                        <option value="10px">10</option>
                        <option value="11px">11</option>
                        <option value="12px">12</option>
                        <option value="13px">13</option>
                        <option value="14px">14</option>
                        <option value="15px">15</option>
                        <option value="16px">16</option>
                        <option value="18px">18</option>
                        <option value="22px">22</option>
                        <option value="24px">24</option>
                        <option value="28px">28</option>
                        <option value="30px">30</option>
                        <option value="32px">32</option>
                        <option value="34px">34</option>
                        <option value="36px">36</option>
                        <option value="40px">40</option>
                        <option value="46px">46</option>
                        <option value="52px">52</option>
                        <option value="72px">72</option>
                        <option value="95px">95</option>
                    </select>

                </div>

                <div className="field" >
                    <label>فونت</label>

                    <select className="btn btn-xs" ng-model="model.fontName">
                        <option value="IRANSans">IRANSans</option>
                        <option value="Droid">Droid</option>
                        <option value="Tahoma">Tahoma</option>
                        <option value="Arial">Arial</option>
                        <option value="adobe">Adobe</option>
                        <option value="sadaf_yekan">Yekan</option>

                    </select>


                </div>

                <div className="field" >
                    <label>رنگ نوشته</label>
                    <ColorPicker color={this.props.color} onChange={(x) => { }} />
                </div>

                <div className="field" >
                    <label>فرمت نمایش</label>
                    <sd-format ng-change="onChange()" ng-model="model.formatString"></sd-format>
                    <div>
                        <input type="text" className="ltr"
                            placeholder="قالب"
                            ng-disabled="model.formatString!='custom'"
                            ng-hide="model.formatString!='custom'"
                            ng-change="onChange()"
                            ng-model-options="{ updateOn: 'blur' }"
                            ng-model="model.formatStringCustom" />
                    </div>
                </div>


            </div>
        );
    }

    renderInline() {
        return (
            <div className="row">
                <style>{` 
                   .row {
                        display:flex; align-items:center;
                    }
                   .ui.form .inline-font-form {
                        margin-left:4px; 
                    }
                   .ui.form select.inline-font-form {
                        padding:2px !important;  width:auto !important;
                    }
                      `}</style>

                <div className="inline-font-form ui mini icon buttons">
                    <button className={"ui button" + (this.props.model.bold ? ' active' : '')} onClick={() => this.change('bold')}><i className="bold icon" /></button>
                    <button className={"ui button" + (this.props.model.italic ? ' active' : '')} onClick={() => this.change('italic')}><i className="italic icon" /></button>
                </div>

                <div className="inline-font-form ui mini icon buttons">
                    <button onClick={() => this.change('align', 'right')} className={"ui button" + (this.props.model.align === 'right' ? ' active' : '')}><i className="align right icon" /></button>
                    <button onClick={() => this.change('align', 'center')} className={"ui button" + (this.props.model.align === 'center' ? ' active' : '')}><i className="align center icon" /></button>
                    <button onClick={() => this.change('align', 'left')} className={"ui button" + (this.props.model.align === 'left' ? ' active' : '')}><i className="align left icon" /></button>
                </div>

                <select className="inline-font-form" value={this.props.model.fontSize} onChange={(e) => this.change('fontSize', e.target.value)} >
                    <option value="8px">8</option>
                    <option value="9px">9</option>
                    <option value="10px">10</option>
                    <option value="11px">11</option>
                    <option value="12px">12</option>
                    <option value="13px">13</option>
                    <option value="14px">14</option>
                    <option value="15px">15</option>
                    <option value="16px">16</option>
                    <option value="18px">18</option>
                    <option value="22px">22</option>
                    <option value="24px">24</option>
                    <option value="28px">28</option>
                    <option value="30px">30</option>
                    <option value="32px">32</option>
                    <option value="34px">34</option>
                    <option value="36px">36</option>
                    <option value="40px">40</option>
                    <option value="46px">46</option>
                    <option value="52px">52</option>
                    <option value="72px">72</option>
                    <option value="95px">95</option>
                </select>

                <select className="inline-font-form" value={this.props.model.fontName} onChange={(e) => this.change('fontName', e.target.value)}>
                    <option value="IRANSans">IRANSans</option>
                    <option value="Droid">Droid</option>
                    <option value="Tahoma">Tahoma</option>
                    <option value="Arial">Arial</option>
                    <option value="adobe">Adobe</option>
                    <option value="sadaf_yekan">Yekan</option>
                </select>

                <ColorPicker className="inline-font-form" color={this.props.model.color} onChange={(e) => this.change('color', e.hex)} />

                {
                    //<select className="inline-font-form" value={this.props.model.formatString} onChange={(e) => this.change('formatString', e.target.value)}  >
                    //    <option value="A">عادی</option>
                    //    <option value=".0%">درصد</option>
                    //    <option value=",.1%">#,#.0%</option>
                    //    <option value=",.2%">#,#.00%</option>
                    //    <option value=",.0f">#,#</option>
                    //    <option value=",.1f">#,#.0</option>
                    //    <option value=",.2f">#,#.00</option>
                    //    <option value=",.3s">#,#K</option>
                    //    <option value="(,.0f">(#,#)</option>
                    //    <option value="(,.1f">(#,#.0)</option>
                    //    <option value="(,.2f">(#,#.00)</option>
                    //    <option value="custom">سفارشی</option>
                    //</select>
                }

                {
                    this.props.model.formatString === 'custom' && <div className="inline-font-form ui mini input">
                        <input type="text" className="ltr" placeholder="قالب" onClick={(e) => this.change('formatStringCustom', e.target.value)} />
                    </div>
                }

            </div>
        );
    }

    render() {
        return this.renderInline();
    }
}