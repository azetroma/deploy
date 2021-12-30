import React from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ColorPicker from './colorPicker';
import UploadFile from './utils/fileUpload';
import Axios from 'axios';
import update from 'immutability-helper';
import { Button, Modal, Form, TransitionablePortal, Checkbox } from 'semantic-ui-react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import notify from './utils/notify';
import TextFormater from './text-formater';
import { cloneWith } from 'lodash';

const ResponsiveGridLayout = WidthProvider(Responsive);
notify.config();

export default class AppsLayout extends React.Component {

    constructor(props) {
        super(props);
        this.gApp = app;
        this.sameHeight = true;
        this.init(this.props.data);
    }

    state = {
        progressGet: true,
        apps: [],
        layout: [],
        compactType: "vertical",
        mounted: false,
        editedApp: {
            detail: {}
        }
    };


    updateDimensions = () => {
        // just for re-render ui 
        this.setState({});
    };

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    init(data) {

        //data.hasAminPermission = false;
        //data.isAdmin = false; 
        let list = data.list;
        _.each(list, item => {
            if (_.isString(item.detail))
                item.detail = JSON.parse(item.detail || '{}');
            item.detail = item.detail || {};
            item.detail.fontHeader = item.detail.fontHeader || this.getFontDefault('header');
            item.detail.fontDesc = item.detail.fontDesc || this.getFontDefault('desc');
            item.detail.picHoriz = item.detail.picHoriz || 'center';
            item.detail.picVertical = item.detail.picVertical || 'center';
        });
        let layout = data.layout || [];
        _.each(list, (item, i) => {
            if (!_.find(layout, { i: 'n' + item.id })) {
                layout.push({ i: 'n' + item.id, x: (i % 4) * 3, y: Infinity, w: 3, h: 3 });
            }
        });

        if (!data.hasAminPermission) {
            _.each(layout, item => {
                item.isDragable = false;
                item.isResizable = false;
            });

            var f = _.filter(layout, item => {
                let id = +item.i.replace('n', '');
                var index = _.findIndex(list, { id: id });
                return index !== -1;
            });

            _.each(list, i => {
                let layout = _.find(f, { i: 'n' + i.id });
                i.x = layout.x;
                i.y = layout.y;
            });
            list = _.orderBy(list, ['y', 'x'], ['asc', 'desc']);


            //for (let i = 0; i < f.length; i++) {
            //    let item = f[i];
            //    let maxY = 0;
            //    for (let j = 0; j < f.length; j++) {
            //        let other = f[j];
            //        if (item.i === other.i) continue;
            //        let a = item.x > other.x && item.x < other.x + other.w;
            //        let b = item.x + item.w > other.x && item.x + item.w < other.x + other.w;
            //        let a2 = item.y > other.y + other.h;

            //        console.log(item, other, a , b, a2);
            //        if ((a || b) && a2) {
            //            maxY = other.y + other.h;
            //        }
            //    }
            //        item.y = maxY;
            //}
            //for (let i = 0; i < f.length; i++) {
            //    let item = f[i];
            //    let maxX = 12;
            //    for (let j = 0; j < f.length; j++) {
            //        let other = f[j];
            //        if (item.i === other.i) continue;
            //        let a = item.y > other.y && item.y < other.y + other.h;
            //        let b = item.y + item.h > other.y && item.y + item.h < other.y + other.h;
            //        let a2 = item.w > other.w + other.x;
            //        console.log(item, other, a , b, a2);
            //        if ((a || b) && a2) {
            //            maxX = other.x + other.w;
            //        }
            //    }
            //    item.x = maxX - item.w;
            //}


            layout = f;
        }
        //this.setState({ apps: list, layout: layout, mounted: true, hasAminPermission: data.hasAminPermission });
        if ($(window).width() <= 768) {
            data.isAdmin = false;
        }

        this.sameHeight = true;
        //app.version = '10.8.1';
        //var isRelease = /^\d+\.\d+\.\d+$/gi.test(app.version || '');

        if (data.layoutVersion === 0 && this.sameHeight) {
            //let versions = app.version.split('.');
            //let digit = +versions[0] * 10000 + +versions[1] * 100 + +versions[2]
            //if (digit <= 10 * 10000 + 8 * 100 + 19) {
            let col = 12;
            if ($(window).width() <= 768) {
                col = 1;
            }

            let rHeight = $('.apps-container-root .nine.wide').width() / col - 9;
            _.each(layout, item => {
                var newH = Math.ceil(item.h * 30 / rHeight);
                console.log(item, newH);
                item.h = newH;
            });
            this.state.saveLayout = layout;
            //}
        }


        this.state = _.merge({ apps: list, layout: layout, mounted: true, hasAminPermission: data.isAdmin }, this.state);
        if (data.layoutVersion === 0 && this.sameHeight) this.saveLayoutHandle();
    }

    onLayoutChange(layout) {

        console.log(layout);

        /*چند بار این متد صدا زده می‌شود و که در خیلی حالات الگو تغییری نکرده است*/
        if (!layout || !layout.length) {
            console.log('### layout is not array - return');
            return;
        }

        if (!this.oldLayout) {
            this.oldLayout = _.merge([], layout);
            console.log('### dont have old layout - return');
            return;
        }

        if (JSON.stringify(this.oldLayout) === JSON.stringify(layout)) {
            console.log('### old layout and layout is equal- return');
            return;
        }

        this.setState({ saveLayout: layout, layout: layout });


        this.oldLayout = _.merge([], layout);
        console.log('### set layout and old layout');

        //Axios.post(app.urlPrefix + 'api/mainmenus/saveLayout/' + this.props.parent, layout)
        //    .then(res => {
        //        console.log(res.data);
        //    })
        //    .finally(res => this.setState({ progressGet: false }));
    }

    saveLayoutHandle() {
        this.setState({ progressLayoutSave: true });
        Axios.post(app.urlPrefix + 'api/mainmenus/saveLayout/' + this.props.parent, this.state.saveLayout)
            .then(res => this.setState({ saveLayout: null }))
            .finally(res => this.setState({ progressLayoutSave: false }));

    }

    updateDetail(type, i, value) {
        var newState = update(this.state, {
            apps: {
                [i]: {
                    detail: {
                        [type]: {
                            $set: value
                        }
                    }
                }
            }
        });
        this.setState(newState);
    }

    setEditedApp(app, i) {
        this.setState({ editedApp: _.merge({}, app), eIndex: i });
    }

    updateApp(type, i, value) {
        var newState = update(this.state, {
            apps: {
                [i]: {
                    [type]: { $set: value }
                }
            }
        });
        this.setState(newState);
    }

    keyup(e, i) {
        if (e.keyCode === 13) $scope.save(app);
        if (e.keyCode === 27) this.updateApp('edit', i, false);
    }

    settings(app, i) {
        this.setEditedApp(app, i);
        this.setState({ open: true });
    }

    permissions(app, i) {
        this.props.permissions.select(app.id).then(r => {
        });
    }

    addChild(app) {
        Axios.post(this.gApp.urlPrefix + 'api/mainmenus/save', { name: 'پروژه جدید', parent: app.id })
            .then(res => {
                this.props.permissions.setPath(app.id);
            })
            .catch(res => { });
    }

    renderApp(app, i) {
        let style = {};
        let layout = _.find(this.state.layout, { i: 'n' + app.id });

        if (!this.state.hasAminPermission) {
            let w = layout.w * 100 / 12;
            let col = 12;
            if ($(window).width() <= 768) {
                w = 100;
                col = 1;
            }

            let rHeight = $('.apps-container-root .nine.wide').width() / col + 1;
            if (!this.sameHeight) rHeight = 30;
            let height = layout.h * rHeight;
            if (this.sameHeight && col === 1) height = rHeight;
            //let height = layout.h * 30;
            //if (app.detail.equalHeight) {
            //    //var containerWidth = $('.apps-container-root .nine.wide').width();
            //    //let width = containerWidth / col - 9;
            //    //height = layout.w * width;
            //    height = layout.w * rHeight;
            //}

            style = { width: w + '%', height: height + 'px', padding: '5px', display: 'inline-block' };
        }
        return (
            <div key={'n' + app.id} style={style} className={"app-card-container " + layout.w + '-' + layout.h} /*ref={e => this.handleHeight(e, app)}*/ >
                <div className={"ui card app-card rtl app-" + app.id}>
                    <a className={"card-item " + (app.detail.fitPic ? 'fit' : '')}
                        href={!app.hasChild ? this.gApp.urlPrefix + '#/app/' + app.id + '/dashboard/' + +app.first : this.gApp.hashUrlPrefix + '#/' + app.id}
                        style={{
                            backgroundImage: 'radial-gradient(circle, ' + app.detail.startColor + ', ' + app.detail.endColor + ')',
                            justifyContent: app.detail.picHoriz === 'left' ? 'flex-end' : app.detail.picHoriz === 'center' ? 'center' : 'flex-start',
                            alignItems: app.detail.picVertical === 'top' ? 'flex-start' : app.detail.picVertical === 'center' ? 'center' : 'flex-end'
                        }}>
                        {app.detail.picId > 0 && <img className="" src={this.gApp.urlPrefix + 'api/upload/getPic/' + app.detail.picId} />}
                    </a>
                    <div className="content app-content" style={{ backgroundColor: app.detail.fontBackground }}>
                        <a style={{
                            fontFamily: app.detail.fontHeader.fontName,
                            color: app.detail.fontHeader.color,
                            fontSize: app.detail.fontHeader.fontSize,
                            fontWeight: app.detail.fontHeader.bold ? 'bold' : 'normal',
                            fontStyle: app.detail.fontHeader.italic ? 'italic' : 'normal',
                            textAlign: app.detail.fontHeader.align
                        }} href={!app.hasChild ? this.gApp.urlPrefix + '#/app/' + app.id + '/dashboard/' + +app.first : this.gApp.hashUrlPrefix + '#/' + app.id}>{app.name}</a>
                        <div style={{
                            fontFamily: app.detail.fontDesc.fontName,
                            color: app.detail.fontDesc.color,
                            fontSize: app.detail.fontDesc.fontSize,
                            fontWeight: app.detail.fontDesc.bold ? 'bold' : 'normal',
                            fontStyle: app.detail.fontDesc.italic ? 'italic' : 'normal',
                            textAlign: app.detail.fontDesc.align
                        }} className="description">{app.detail.desc}</div>
                    </div>

                    {(app.permissions.EditPermission || app.permissions.DeletePermission) && <div className="extra app-extra" >
                        <span className=" ">
                            <i className="link move icon" />
                        </span>
                        <span className=" ">
                            {app.permissions.DeletePermission && <i className="link trash alternate outline icon" onClick={() => this.remove(app, i)} />}
                            {app.permissions.EditPermission && <i className="link cog icon popup-btn" onClick={() => this.settings(app, i)} />}
                            {app.permissions.EditPermission && <i className="link lock icon popup-btn" onClick={() => this.permissions(app, i)} />}
                            {app.permissions.EditPermission && <i className="link add icon popup-btn" onClick={() => this.addChild(app, i)} />}
                        </span>
                    </div>}
                </div>
            </div>
        );
    }

    save() {
        this.setState({ saveProgress: true });
        Axios.post(app.urlPrefix + 'api/mainmenus/save', this.state.editedApp)
            .then(res => {
                this.setState({ open: false });
                if (this.state.eIndex !== -1) {
                    let permissions = this.state.apps[this.state.eIndex].permissions;
                    let newState = update(this.state, {
                        apps: {
                            [this.state.eIndex]: {
                                $set: { ...res.data, permissions: permissions }
                            }
                        }
                    });
                    this.setState(newState);

                } else {
                    res.data.detail.fontDesc = {};
                    res.data.detail.fontHeader = {
                        color: '#333',
                        fontSize: '18px',
                        bold: true,
                    }

                    let newState = update(this.state, {
                        apps: {
                            $splice: [[-1, 0, {
                                ...res.data,
                                permissions: {
                                    DeletePermission: true,
                                    EditPermission: true,
                                    ViewPermission: true
                                }
                            }]]
                        }
                    });
                    newState = update(newState, {
                        layout: {
                            $splice: [[-1, 0, { i: 'n' + res.data.id, x: 9, y: Infinity, w: 3, h: 3 }]]
                        }
                    });
                    newState.saveLayout = newState.layout;
                    this.setState(newState);
                    this.saveLayoutHandle();
                }
                notify.notify();
            })
            .catch(e => { notify.notifyError(); })
            .finally(res => { this.setState({ saveProgress: false }); });

    }

    remove(app, i) {
        var f = confirm('آیا برای حذف اطمینان دارید؟');
        if (!f) return;

        if (!app.id) {
            let apps = update(this.state.apps, { $splice: [[i, 1]] });
            this.setState({ apps: apps });
            return;
        }
        this.updateApp('removeProgress', i, true);
        Axios.post(this.gApp.urlPrefix + 'api/mainmenus/delete/' + app.id)
            .then(res => {
                let apps = update(this.state.apps, { $splice: [[i, 1]] });
                this.setState({ apps: apps });
                notify.notify();
            })
            .catch(res => { notify.notifyError(); this.updateApp('removeProgress', i, false); })
            .finally(res => { });

    }

    getFontDefault(t) {
        if (t === 'header') {
            return {
                color: '#212121',
                fontSize: '18px',
                fontName: 'IRANSans',
                align: 'right',
                bold: true
            };
        }
        return {
            color: '#616161',
            fontSize: '14px',
            fontName: 'IRANSans',
            align: 'right',
            bold: false
        };
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
                    <Modal.Header>ویرایش</Modal.Header>
                    <Modal.Content scrolling>
                        <Modal.Description>
                            <Form>
                                <div className="inline fields">
                                    <div className="two wide column field">
                                        <label>نام</label>
                                    </div>
                                    <div className="ten wide column field">
                                        <input value={this.state.editedApp.name || ''} onChange={(x) => { this.setState(update(this.state, { editedApp: { name: { $set: x.target.value } } })); }} />
                                    </div>
                                </div>
                                <div className="inline fields">
                                    <div className="two wide column field">
                                        <label>توضیحات</label>
                                    </div>
                                    <div className="ten wide column field">
                                        <input value={this.state.editedApp.detail.desc || ''} onChange={(x) => { this.setState(update(this.state, { editedApp: { detail: { desc: { $set: x.target.value } } } })); }} />
                                    </div>
                                </div>
                                <div className="inline fields">
                                    <div className="two wide column field">
                                        <label>فونت تیتر</label>
                                    </div>

                                    <div className="ten wide column field">
                                        <TextFormater model={this.state.editedApp.detail.fontHeader || this.getFontDefault('header')} onChange={(d) => { this.setState(update(this.state, { editedApp: { detail: { fontHeader: { $set: d } } } })); }} />
                                    </div>
                                </div>
                                <div className="inline fields">
                                    <div className="two wide column field">
                                        <label>فونت توضیحات</label>
                                    </div>

                                    <div className="ten wide column field">
                                        <TextFormater model={this.state.editedApp.detail.fontDesc || this.getFontDefault('desc')} onChange={(d) => { this.setState(update(this.state, { editedApp: { detail: { fontDesc: { $set: d } } } })); }} />
                                    </div>
                                </div>
                                <div className="field">
                                    <div className="inline field">
                                        <label>رنگ پشت زمینه تیتر و توضیحات</label>
                                        <ColorPicker disableAlpha={false} color={this.state.editedApp.detail.fontBackground} onChange={(x) => { this.setState(update(this.state, { editedApp: { detail: { fontBackground: { $set: x.hex } } } })); }} />
                                    </div>
                                </div>
                                <div className="field">
                                    <div className="inline field">
                                        <label>رنگ شروع پشت زمینه</label>
                                        <ColorPicker color={this.state.editedApp.detail.startColor} onChange={(x) => { this.setState(update(this.state, { editedApp: { detail: { startColor: { $set: x.hex } } } })); }} />
                                    </div>
                                </div>
                                <div className="field">
                                    <div className="inline field">
                                        <label>رنگ پایان پشت زمینه</label>
                                        <ColorPicker color={this.state.editedApp.detail.endColor} onChange={(x) => { this.setState(update(this.state, { editedApp: { detail: { endColor: { $set: x.hex } } } })); }} />
                                    </div>
                                </div>

                                <div className="field">
                                    <Checkbox label="عکس بدون حاشیه" checked={this.state.editedApp.detail.fitPic} onChange={(e, d) => { this.setState(update(this.state, { editedApp: { detail: { fitPic: { $set: d.checked } } } })); }} />
                                </div>

                                <div className="inline field">
                                    <label>مکان افقی نمایش عکس</label>

                                    <div className="inline-font-form ui mini icon buttons">
                                        <button onClick={() => this.setState(update(this.state, { editedApp: { detail: { picHoriz: { $set: 'right' } } } }))} className={"ui button" + (this.state.editedApp.detail.picHoriz === 'right' ? ' active' : '')}><i className="align right icon" /></button>
                                        <button onClick={() => this.setState(update(this.state, { editedApp: { detail: { picHoriz: { $set: 'center' } } } }))} className={"ui button" + (this.state.editedApp.detail.picHoriz === 'center' ? ' active' : '')}><i className="align center icon" /></button>
                                        <button onClick={() => this.setState(update(this.state, { editedApp: { detail: { picHoriz: { $set: 'left' } } } }))} className={"ui button" + (this.state.editedApp.detail.picHoriz === 'left' ? ' active' : '')}><i className="align left icon" /></button>
                                    </div>


                                </div>
                                <div className="field">
                                    <div className="inline field">
                                        <label>مکان عمودی نمایش عکس</label>
                                        <div className="inline-font-form ui mini icon buttons">
                                            <button onClick={() => this.setState(update(this.state, { editedApp: { detail: { picVertical: { $set: 'top' } } } }))} className={"ui button" + (this.state.editedApp.detail.picVertical === 'top' ? ' active' : '')}><i className="align right icon" /></button>
                                            <button onClick={() => this.setState(update(this.state, { editedApp: { detail: { picVertical: { $set: 'center' } } } }))} className={"ui button" + (this.state.editedApp.detail.picVertical === 'center' ? ' active' : '')}><i className="align center icon" /></button>
                                            <button onClick={() => this.setState(update(this.state, { editedApp: { detail: { picVertical: { $set: 'bottom' } } } }))} className={"ui button" + (this.state.editedApp.detail.picVertical === 'bottom' ? ' active' : '')}><i className="align left icon" /></button>
                                        </div>
                                    </div>
                                </div>

                                <div className="field">
                                    <UploadFile pic={this.state.editedApp.detail.pic} text="انتخاب تصویر" onChange={(x) => { this.setState(update(this.state, { editedApp: { detail: { pic: { $set: x } } } })); }} />
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

    newApp() {
        this.setEditedApp({ detail: {}, parent: this.props.parent }, -1);
        this.setState({ open: true });
    }

    //handleRowHeight(e) {
    //    return 30;
    //}

    render() {
        let ww = $(window).width();

        if (!this.state.hasAminPermission) {
            let style = { display: 'flex', flexWrap: 'wrap' };
            if (ww <= 768) {
                style = { display: 'block' };
            }

            return (<div style={style}>
                <style>{`
                          .ui.card.app-card { overflow:hidden;}  
                          .ui.card>.extra.app-extra { xmin-height: 40px!important;}  
                          .ui.card>.content.app-content { 
                                position: absolute;
                                height: auto;
                                right: 0;
                                bottom: 0;
                                border: none;  
                                width: 100%;  
                            }  
                           .react-grid-item.react-draggable { touch-action: auto !important;}  
                          .ui.card>.extra.app-extra{ position: absolute; left:0; text-align:left;}
                          .ui.dimmer {
                            transition: background-color 0.4s ease;
                            background-color: transparent;
                          }

                          .modal-fade-in .ui.dimmer {
                            background-color: #00000099;
                          }
                     `}</style>
                {_.map(this.state.apps || [], (el, i) => this.renderApp(el, i))}
                {this.renderModal()}
            </div>);

        }

        let height = 30;

        if (this.sameHeight)
            height = $('.apps-container-root .nine.wide').width() / 12 - 9;

        return (
            <div className="ltr" >
                <style>{`
                          .ui.card.app-card { overflow:hidden;}  
                          .ui.card>.extra.app-extra { xmin-height: 40px!important;}  
                          .ui.card>.content.app-content { 
                                position: absolute;
                                height: auto;
                                right: 0;
                                bottom: 0;
                                border: none;  
                                width: 100%;  
                            }  
                           .react-grid-item.react-draggable { touch-action: auto !important;}  
                          .ui.card>.extra.app-extra{ position: absolute; left:0; text-align:left;}
                          .ui.dimmer {
                            transition: background-color 0.4s ease;
                            background-color: transparent;
                          }

                          .modal-fade-in .ui.dimmer {
                            background-color: #00000099;
                          }
                     `}</style>

                <ResponsiveGridLayout
                    onLayoutChange={(layout) => this.onLayoutChange(layout)}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    className="layout"
                    layouts={{ lg: this.state.layout }}
                    cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
                    measureBeforeMount={false}
                    useCSSTransforms={this.state.mounted}
                    rowHeight={height}
                    autoSize
                    draggableHandle=".link.move.icon">
                    {_.map(this.state.apps || [], (el, i) => this.renderApp(el, i))}
                </ResponsiveGridLayout>
                <div style={{ textAlign: 'right' }}>
                    {
                        this.state.hasAminPermission && this.state.saveLayout && <div className={"ui green icon button" + (this.state.progressLayoutSave ? ' loading disabled' : '')} onClick={() => this.saveLayoutHandle()}> <i className="xicon save outline" />ذخیره چیدمان</div>
                    }
                    {
                        this.state.hasAminPermission && <div className="ui basic icon button" onClick={() => this.newApp()}> <i className="icon add" />پروژه جدید</div>
                    }
                </div>
                {this.renderModal()}
            </div>
        );
        //<div className="setting-popup ui wide basic popup top left transition hidden" style={{ minWidth: '200px' }} >
        //    <div className="ui form">

        //        <div className="field">
        //            <label>رنگ شروع</label>
        //            <input ng-model="app.detail.startColor" />
        //        </div>

        //        <div className="field">
        //            <label>رنگ پایان</label>
        //            <input ng-model="app.detail.endColor" />
        //        </div>
        //        <div className="field">
        //            <label>انتخاب آیکن</label>
        //            <input type="file" ng-model="app.pic" index="{{$index}}" xonchange="angular.element(this).scope().previewFile(this )" />
        //        </div>
        //        <div className="field">
        //            <div className="ui button fluid" ng-click="addChild(app)">اضافه کردن زیر پروژه</div>
        //        </div>
        //        <div className="field">
        //            <div className="ui button fluid icon" ng-click="showSettings(app)"><i className="ui icon cog" /> تنظیمات</div>
        //        </div>

        //    </div>
        //</div>
    }

}