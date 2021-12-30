import React from 'react';
import Axios from 'axios';
import { Accordion, Checkbox, Dropdown } from 'semantic-ui-react';

export default class RoleSelector extends React.Component {
    state = {}

    componentDidMount() {
        console.log('### [RoleSelector] componentDidMount');
        this.getRoles(0).then(res => {
            this.setState({ roles: res.data.list });
        });
    }

    getRoles(parent) {
        return Axios.get(app.urlPrefix + 'api/roles/getList/' + parent).then(res => {
            if (res.data.list) {
                _.each(res.data.list, d => {
                    if (!d.action) d.action = 1;
                });
            }
            return res;
        });
    }

    getChildrens(role, roles) {
        role.isOpen = !role.isOpen;

        if (role.childs === 0 || role.children) {
            $(role.el).find('.content').transition(role.isOpen ? 'fade up' : 'fade down');
            this.update(); return;
        }

        role.progress = true;
        this.update();
        this.getRoles(role.id).then(res => {
            role.children = res.data.list;
            this.update();
        }).finally(e => {
            role.progress = false;
            this.update();
        });
    }

    check(role) {
        role.check = !role.check;
        this.update();
    }

    getCheched = (roles, selected) => {
        _.each(roles, role => {
            if (role.check) selected.push(role);
            if (role.children) this.getCheched(role.children, selected);
        });
    }

    update() {
        this.setState({ roles: this.state.roles });
        let selected = [];
        this.getCheched(this.state.roles, selected);
        this.props.onChange(selected);
    }

    renderRoles(roles) {
        if (!roles) return null;
        return roles.map(role => {
            return (
                <div key={role.id} className="" ref={e => role.el = e} >
                    <div className={role.childs !== 0 ? "pointer" : ""} style={{ paddingRight: role.childs === 0 ? '24px' : '0' }}>
                        {role.childs !== 0 && <i style={{ width: '24px', margin: '0' }} onClick={e => this.getChildrens(role, roles)} className={"ui icon angle " + (role.isOpen ? 'down' : 'left')} />}
                        <Checkbox label={role.name} onChange={e => this.check(role)} />
                        &nbsp; &nbsp;
                        {role.progress && <div className="ui tiny active inline loader" />}
                        {(
                            <div style={{ display: 'inline-block', visibility: role.check ? 'visible' : 'hidden' }}>
                                <Dropdown placeholder='مجوزهای تکمیلی' multiple className="tiny compact"
                                    options={[
                                        { text: 'کامنت', value: 8 }
                                        , { text: 'خروجی اکسل', value: 9 }
                                        , { text: 'فیلتر', value: 10 }
                                        , { text: 'توضیحات', value: 11 }]}
                                    value={role.extra || []}
                                    onChange={(e, d) => {
                                        role.extra = d.value;
                                        this.update();
                                    }}
                                />
                                <Dropdown placeholder='مجوز دسترسی' className="tiny compact"
                                    options={[
                                        { text: 'مشاهده', value: 1 }
                                        , { text: 'مشاهده و ویرایش', value: 2 }
                                        , { text: 'مشاهده و ویرایش و حذف', value: 4 }
                                    ]}
                                    value={role.action || 1}
                                    onChange={(e, d) => {
                                        role.action = d.value;
                                        this.update();
                                    }}
                                />
                            </div>

                        )
                        }
                    </div>
                    <div className="content" style={{ padding: '0 1rem' }}>
                        {role.children ? this.renderRoles(role.children) : null}
                    </div>
                </div>
            );
        });
    }

    render() {
        return (
            <div>
                {this.renderRoles(this.state.roles)}
            </div>
        );
    }

}