/* eslint react/no-multi-comp: 0 */
/* eslint no-extra-parens: 0 */

import React from 'react';
import { Button, Icon, Menu, Modal, Form, TransitionablePortal } from 'semantic-ui-react';
import { post, get } from './utils/http';
import Axios from 'axios';
import notify from './utils/notify';
import RoleSelector from './select-roles';
import DashboardSelector from './select-dashboard';
import Step from './step';
import CustomChartSelector from './select-custom-chart';

export default class UserVariablesList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            steps: [
                { label: 'آپلود فایل', icon: 'icon fal fa-cloud-upload', active: 1 },
                { label: 'انتخاب نمودارها و تعیین منابع داده', icon: 'icon fal fa-tasks', active: 0 },
                { label: 'انتخاب مجوزها و داشبورها', icon: 'icon fal fa-lock-open' }
            ],
            currentStep: 0
        };
    }

    componentWillMount() {
        this.setState({ loadProgress: true });
    }

    componentDidMount() {
        Axios.get(app.urlPrefix + 'api/charts/checkPerrmission')
            .then(data => {
                this.setState({ permissions: data.data });
            })
            .catch(this.error)
            .finally(() => {
                this.setState({ loadProgress: false });
            });
    }

    upload() {
        let formData = new FormData();
        if (!this.form[0].files.length) {
            notify.notifyError('فایل ورودی را انتخاب کنید');
            return;
        }

        let file = this.form[0].files[0];

        formData.append('data', file, file.name);

        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        };

        this.setState({ progressUpload: true });
        Axios.post(app.urlPrefix + 'api/charts/processFile', formData, config)
            .then(data => {
                _.each(data.data.list, item => { item.check = true; });

                this.setState({
                    charts: data.data.list,
                    dashboardName: data.data.name,
                    checkAll: true
                });

                this.gotoStep(1);
            })
            .catch(this.error)
            .finally(() => {
                this.setState({ progressUpload: false });
            });
    }

    changeDatasource(item) {

        let copy = _.merge({}, item);

        this.props.datasources
            .select(null, { type: 'datasources' })
            .then((res) => {
                var ds = res.selected[0];

                _.each(this.state.charts, chart => {
                    chart.Datasources.map(d => {
                        if (d.id === copy.id) {
                            d.id = ds.id;
                            d.name = ds.name;
                        }
                    });
                });

                this.setState({ charts: this.state.charts });
            });
    }

    openCustomChartSelector(item) {
        let copy = _.merge({}, item);
        this.setState({
            open: !this.state.open,
            selectedChart: (selected) => {
                console.log(selected, item);

                _.each(this.state.charts, chart => {
                    if (copy.IsCustom && chart.IsCustom && chart.Type === copy.Type) {
                        chart.Type = selected[0].id;
                        chart.customChartName = selected[0].name;
                    }
                });

                this.setState({ open: false, charts: this.state.charts });
            }
        });
    }

    changeCustomChart(item) {

        let copy = _.merge({}, item);

        CustomChartSelector
            .select(null, { type: 'datasources' })
            .then((res) => {
                var ds = res.selected[0];

                _.each(this.state.charts, chart => {
                    chart.Datasources.map(d => {
                        if (d.id === copy.id) {
                            d.id = ds.id;
                            d.name = ds.name;
                        }
                    });
                });

                this.setState({ charts: this.state.charts });
            });
    }

    checkAll() {
        if (!this.state.checkAll) {
            _.each(this.state.charts, item => { item.check = true; });
            this.setState({ charts: this.state.charts, checkAll: true });
            return;
        }
        _.each(this.state.charts, item => { item.check = false; });
        this.setState({ charts: this.state.charts, checkAll: false });
    }

    gotoStep(step) {
        let steps = this.state.steps;

        this.setState({
            currentStep: step,
            steps: steps
        });
    }

    submit() {
        this.setState({ progressSave: true });

        let dashs = this.selectedDashboard || [];
        dashs = dashs.map(item => item.id);

        let roles = this.selectedRole || [];
        let extra = roles.map(role => ({ id: role.id, permissions: role.extra }));
        let permissions = roles.map(role => ({ id: role.id, action: role.action }));

         
        Axios.post(app.urlPrefix + 'api/charts/import', {
            charts: this.state.charts,
            dashboards: dashs,
            extraPermissions: extra,
            permissions: permissions,
            dashboardName: this.state.dashboardName
        })
            .then(data => {
                console.log(data);
                this.gotoStep(0);
                notify.notify('ذخیره نمودارها با موفقیت انجام شد');
                this.setState({ charts: null });
            })
            .catch(this.error)
            .finally(() => {
                this.setState({ progressSave: false });
            });
    }

    error = e => {
        try {
            notify.notifyError(e.response.data.desc);
        } catch (e) {
            notify.notifyError();
        }
    }

    renderStep0() {
        return (
            <div className={this.state.currentStep === 0 ? 'visible' : 'hidden'}>
                <div className="field">
                    <label>انتخاب فایل</label>
                    <form ref={e => this.form = e}>
                        <input type="file" />
                    </form>
                </div>
                <div className={"ui button " + (this.state.progressUpload ? 'loading disabled' : '')} onClick={() => this.upload()} >آپلود فایل</div>
                {this.state.charts && <div className={"ui button "} onClick={e => this.gotoStep(1)}>مرحله بعد</div>}
            </div>
        );
    }

    renderStep1() {
        if (!this.state.charts) return null;

        return (
            <div className={this.state.currentStep === 1 ? 'visible' : 'hidden'}>
                <table className="ui celled table">
                    <thead><tr>
                        <th style={{ width: '50px' }}><input checked={this.state.checkAll} type="checkbox" onChange={e => this.checkAll()} /></th>
                        <th style={{ width: '50px' }}>#</th><th>نام</th><th>منابع داده</th><th>نمودار دلخواه</th></tr></thead>
                    <tbody>
                        {this.state.charts && this.state.charts.map((item, i) => {
                            return (
                                <tr key={i}>
                                    <td><input type="checkbox" checked={item.check} onChange={e => { item.check = !item.check; this.setState({ charts: this.state.charts }); }} /></td>
                                    <td>{persian(i + 1, true)}</td>
                                    <td className="pointer" onClick={() => this.edit(item)}> {item.Name} </td>
                                    <td>
                                        <div>
                                            {item.Datasources.map((d, i) => {
                                                return (
                                                    <div key={i} className="ui button" onClick={e => this.changeDatasource(d)} >{d.name} </div>
                                                );

                                            })}
                                        </div>

                                    </td>
                                    <td>
                                        <div>
                                            {
                                                item.IsCustom &&
                                                <div className="ui button" onClick={e => this.openCustomChartSelector(item)}  >{item.customChartName} </div>
                                            }
                                        </div>

                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {(!this.state.charts.length) && <div><small>داده‌ای برای نمایش وجود ندارد</small></div>}
                <br />
                <br />
                <div className={"ui button "} onClick={e => this.gotoStep(0)}>مرحله قبل</div>
                <div className={"ui blue button "} onClick={e => this.gotoStep(2)}>مرحله بعد</div>

            </div>);
    }

    renderStep2() {
        return (
            <div className={this.state.currentStep === 2 ? 'visible' : 'hidden'}>

                <div className="ui fluid input">
                    <b>نام صفحه داشبورد &nbsp;&nbsp;&nbsp;</b>
                    <input type="text" value={this.state.dashboardName || ''} onChange={e => this.setState({ dashboardName: e.target.value })} />
                </div>


                <div className="ui horizontal secondary segments" style={{ backgroundColor: '#fafafa' }}>
                    <div className="ui segment" style={{ flexGrow: 1, width: 0 }}>
                        <h5 className="ui header">انتخاب گروه داشبورد</h5>
                        <DashboardSelector type="category" onChange={e => {
                            this.selectedDashboard = e;
                        }}
                        />
                    </div>
                    <div className="ui segment" style={{ flexGrow: 1, width: 0 }}>
                        <h5 className="ui header">مجوزها</h5>
                        <RoleSelector onChange={e => {
                            this.selectedRole = e;
                        }}
                        />
                    </div>
                </div>
                <div className={"ui button "} onClick={e => this.gotoStep(1)}>مرحله قبل</div>
                <div className={"ui blue button " + (this.state.progressSave ? 'loading disabled' : '')} onClick={e => this.submit()}>ذخیره نمودارها</div>
            </div>
        );
    }

    render() {
        if (this.state.loadProgress)
            return <div className="ui active inline centered loader" />;

        if (!this.state.permissions.add || !this.state.permissions.edit)
            return <div className="ui orange inverted secondary segment" style={{ margin:'100px 40px' }} >شما مجوز مشاهده این قسمت را ندارید</div>;

        return (

            <div className="chart-import">
                <h3 className="ui header">وارد کردن نمودارها به صورت دسته‌ای</h3>
                <style>{
                    `
.chart-import .visible{
    visibility: visible;
    height: auto;
}
.chart-import .hidden{
    visibility: hidden;
    height: 0;
    overflow: hidden;}
`
                }</style>

                <Step items={this.state.steps} currentStep={this.state.currentStep} />

                <div className="ui form">

                    {this.renderStep0()}
                    {this.renderStep1()}
                    {this.renderStep2()}
                    <CustomChartSelector open={this.state.open} onChange={this.state.selectedChart} />
                </div>
            </div>
        );
    }


}


