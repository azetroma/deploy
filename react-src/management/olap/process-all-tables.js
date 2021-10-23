/* eslint react/no-multi-comp: 0 */
/* eslint no-extra-parens: 0 */

import React from 'react';
import Axios from 'axios';

export default class ProcessAllTables extends React.Component {
    constructor(p) {
        super(p);
        this.state = {
            processProgress: false,
            error: null
        };
    }

    processAll() {
        this.setState({ processProgress: true, error: null });
        Axios.get(app.urlPrefix + 'api/olap/processAll')
            .then((res) => {
                this.setState({ tables: res.data.tables, times: res.data.times });
            })
            .catch((error) => {
                this.setState({ error: error.response.data.desc });
            })
            .finally((res) => {
                this.setState({ processProgress: false });
            });

    }

    addColumn() {
        this.setState({ addColumnProgress: true, error: null });
        Axios.get(app.urlPrefix + 'api/olap/addColumn')
            .then((res) => {
            })
            .catch((error) => {
                this.setState({ error: error.response.data.desc });
            })
            .finally((res) => {
                this.setState({ addColumnProgress: false });
            });
    }

    showError() {
        if (this.state.error)
            return <div className="ui red secondary segment">{this.state.error}</div>;
    }

    showResult() {
        if (!this.state.tables) return;
        var el;
        if (this.state.tables.length) {
            el = (
                <ul>جدول‌هایی که پردازش شده‌اند
                    {this.state.tables.map((item, i) => {
                    return <li key={i} >{item}</li>;
                })}
                </ul>
            );
        } else {
            el = <div>تمام جداول قبلا پردازش شده‌اند و یا جدولی برای پردازش وجود ندارد</div>;
        }

        return <div className="ui segment"> {el}</div>;

    }

    render() {
        return (
            <div className="ui form">
                <div className={"ui button primary" + (this.state.processProgress ? ' loading disabled' : '')} onClick={() => this.processAll()} >اضافه کردن تمام جداول به مدل داده</div>
                <div className={"ui button primary" + (this.state.addColumnProgress ? ' loading disabled' : '')} onClick={() => this.addColumn()} >اضافه کردن ستون جدید</div>
                <small>در صورتی که جدولی قبلا اضافه شده باشد دوباره اضافه نخواهد شد.</small>

                {this.showError()}

                {this.showResult()}

            </div>
        );
    }
}