/* eslint react/no-multi-comp: 0 */
/* eslint no-extra-parens: 0 */

import React from 'react';
import Axios from 'axios';


export default class TelegramConfig extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            phone: '',
            apiId: '',
            apiHash: '',
            mode: 'init'
        };
    }

    componentDidMount() {
        this.getInfo();
    }

    sendCode() {
        this.setState({ saveProgress: true, error: null, isAuthenticated: false });
        Axios
            .get(app.urlPrefix + 'api/telegram/save', {
                params: {
                    apiHash: this.state.apiHash,
                    apiId: this.state.apiId,
                    phone: this.state.phone
                }
            })
            .then(() => {
                this.setState({ mode: 'code' });
            })
            .catch((error) => {
                this.setState({ error: error.response.data.desc });
            })
            .finally(() => {
                this.setState({ saveProgress: false });
            });
    }

    getInfo() {
        this.setState({ getInfoProgress: true, mode: 'init', error: null, isAuthenticated: false });
        Axios.get(app.urlPrefix + 'api/telegram/getinfo')
            .then((res) => {
                this.setState({
                    apiId: res.data.apiId,
                    apiHash: res.data.apiHash,
                    phone: res.data.phone,
                    isAuthenticated: res.data.isAuthenticated,
                }); 
            })
            .catch((error) => {
                this.setState({ error: error.response.data.desc });
            })
            .finally(() => {
                this.setState({ getInfoProgress: false });
            })
            ;
    }

    checkCode() {
        this.setState({ checkCodeProgress: true });
        Axios
            .post(app.urlPrefix + 'api/telegram/checkCode', {
                password: this.state.password,
                code: this.state.code
            })
            .then(() => {
                this.getInfo();
            })
            .catch((error) => {
                this.setState({ error: error.response.data.desc });
            })
            .finally(() => {
                this.setState({ checkCodeProgress: false, mode: 'init' });
            })
            ;

    }

    showError() {
        if (this.state.error) {
            return <div className="red secondary segment ui">{this.state.error}</div>;
        }
    }

    showAuthenticated() {
        if (this.state.isAuthenticated) {
            return <div className="green secondary segment ui">حساب شما قبلا احراز هویت شده است و نیازی به احراز هویت مجدد نیست.</div>;
        }
    }

    renderCode() {
        return (
            <div className="ui form">
                <div className="field">
                    <label>کد ارسال شده توسط تلگرام</label>
                    <input type="text" value={this.state.code} onChange={(e) => this.setState({ code: e.target.value })} />
                </div>

                <div className="field">
                    <label>کلمه عبور </label>
                    <input type="text" value={this.state.password} onChange={(e) => this.setState({ password: e.target.value })} />
                    <div><small>در صورتی که از ورود دو عاملی استفاده میکنید</small></div>
                </div>

                <div className={"ui primary button " + (this.state.checkCodeProgress ? 'loading disabled' : '')} onClick={() => this.checkCode()}>ارسال کد</div>
            </div>
        );
    }

    render() {
        if (this.state.getInfoProgress)
            return <div className="ui active inline centered loader" />;

        if (this.state.mode === 'code')
            return this.renderCode();

        return (
            <div className="ui form">

                {this.showError()}
                {this.showAuthenticated()}

                <div className="field">
                    <label>شماره موبایل (به صورت +۹۸)</label>
                    <input type="text" value={this.state.phone} onChange={(e) => this.setState({ phone: e.target.value })} />
                </div>
                <div className="field">
                    <label>ApiId</label>
                    <input type="number" value={this.state.apiId} onChange={(e) => this.setState({ apiId: e.target.value })} />
                </div>
                <div className="field">
                    <label>ApiHash</label>
                    <input type="text" value={this.state.apiHash} onChange={(e) => this.setState({ apiHash: e.target.value })} />
                </div>

                <div>
                    راهنمای دریافت اطلاعات ApiId و ApiHash
                    <ul>
                        <li>ساخت حساب توسعه دهیده از این <a href="https://my.telegram.org" target="_blank"> لینک </a></li>
                        <li>دریافت اطلاعات شناسه و کد درهم از  <b>  API development tools  </b></li>
                    </ul>
                </div>

                <div className={"ui primary button " + (this.state.saveProgress ? 'loading disabled' : '')} onClick={() => this.sendCode()}>احراز هویت</div>

            </div>


        );
    }

}