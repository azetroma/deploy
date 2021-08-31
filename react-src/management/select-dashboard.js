import React from 'react';
import Axios from 'axios';
import { Accordion, Checkbox, Dropdown } from 'semantic-ui-react';

export default class DashboardSelector extends React.Component {
    state = {}

    componentDidMount() {
        this.getMainMenus(0).then(res => {
            this.setState({ menus: res.data.list });
        });
    }

    getMainMenus(parent) {
        return Axios.get(app.urlPrefix + 'api/mainmenus/get/' + parent);
    }

    getMenus(parent) {
        return Axios.get(app.urlPrefix + 'api/menus/MenuCategories/' + parent);
    }

    getChildrens(mainmenu) {
        mainmenu.isOpen = !mainmenu.isOpen;
        if (!mainmenu.hasChild || mainmenu.children || mainmenu.getCats) {

            if (mainmenu.getCats || mainmenu.children) {
                $(mainmenu.el).find('> .content').transition(mainmenu.isOpen ? 'fade up' : 'fade down');
            }

            if (!mainmenu.getCats) {
                mainmenu.getCats = true;
                this.getMenus(mainmenu.id).then(res => {
                    mainmenu.cats = res.data.data;
                    this.update();
                }).finally(e => {
                    mainmenu.progress = false;
                    this.update();
                });
            }

            this.update();
            return;
        }

        mainmenu.progress = true;
        this.update();

        if (mainmenu.hasChild) {
            this.getMainMenus(mainmenu.id).then(res => {
                mainmenu.children = res.data.list;
                this.update();

            }).finally(e => {
                mainmenu.progress = false;
                this.update();
            });
        }
    }

    check(item) {
        item.check = !item.check;
        this.update();
    }

    update() {
        this.setState({ menus: this.state.menus });
        let selected = [];
        this.rec(this.state.menus, selected);
        let s = selected.map(item => {
            return {
                id: item.menu.Id,
                name: item.menu.Name,
            };
        });
        this.props.onChange(s);
    }

    hasChild(m) {
        if (m.hasChild || m.first !== 0) return true;
        return false;
    }

    renderMainMenus(mainmenus) {
        if (!mainmenus) return null;
        return mainmenus.map(mainmenu => {
            return (
                <div key={mainmenu.id} className="" ref={e => mainmenu.el = e} >
                    <div className={this.hasChild(mainmenu) ? "pointer" : ""} onClick={e => this.getChildrens(mainmenu, mainmenus)} style={{ paddingRight: !this.hasChild(mainmenu) ? '24px' : '0' }}>
                        {this.hasChild(mainmenu) && <i style={{ width: '24px', margin: '0' }} className={"ui icon angle " + (mainmenu.isOpen ? 'down' : 'left')} />}
                        {mainmenu.name}&nbsp; &nbsp;
                        {mainmenu.progress && <div className="ui tiny active inline loader" />}
                    </div>
                    <div className="content" style={{ padding: '0 1rem' }}>
                        {mainmenu.children ? this.renderMainMenus(mainmenu.children) : null}
                        {mainmenu.cats && this.renderCats(mainmenu.cats)}
                    </div>
                </div>
            );
        });
    }

    renderMenu(menus) {
        return menus.map((menu, i) => {
            return (
                <div key={i}>
                    <Checkbox label={menu.menu.Name} checked={menu.check} onChange={e => this.check(menu)} />
                </div>
            );
        });
    }

    openCat(cat) {
        cat.isOpen = !cat.isOpen;
        $(cat.el).find('> .content').transition(cat.isOpen ? 'fade up' : 'fade down');
        this.update();
    }

    renderCats(cats) {
        if (!cats) return null;
        return cats.map(cat => {
            if (this.props.type === 'category') {
                return (
                    <div key={cat.category.Id}>
                        <Checkbox label={cat.category.Name} checked={cat.check} onChange={e => this.check(cat)} />
                    </div>
                );
            }
            return (
                <div key={cat.category.Id} className="" ref={e => cat.el = e} >
                    <div className={cat.childs !== 0 ? "pointer" : ""} onClick={e => this.openCat(cat)} style={{ paddingRight: cat.menus.length === 0 ? '24px' : '0' }}>
                        {cat.menus.length !== 0 && <i style={{ width: '24px', margin: '0' }} className={"ui icon angle " + (cat.isOpen ? 'down' : 'left')} />}
                        {cat.category.Name}
                    </div>
                    <div className="content transition hidden" style={{ padding: '0 1rem' }}>
                        {cat.menus ? this.renderMenu(cat.menus) : null}
                    </div>
                </div>
            );
        });
    }

    rec = (mms, selected) => {

        if (this.props.type === "category") {
            _.each(mms, mm => {
                _.each(mm.cats, (cat) => {
                    if (cat.check) {
                        selected.push({ menu: { Id: cat.category.Id, Name: cat.category.Name } });
                    }
                });
                return;
            });
        }

        _.each(mms, mm => {
            _.each(mm.cats, (cat) => {
                _.each(cat.menus, m => {
                    if (m.check) {
                        selected.push(m);
                    }
                });
            });
            if (mm.children) {
                _.each(mm.children, item => {
                    rec(item, selected);
                });
            }
        });
    };

    renderSelected() {
        if (!this.state.menus) return null;
        if (this.props.type === "category") return null;

        let selected = [];
        this.rec(this.state.menus, selected);
        return selected.map((item, i) => {
            return (
                <div className="ui icon label orange" key={i}>
                    {item.menu.Name}
                    <i className="delete icon" onClick={e => this.cleanMenu(item)} />
                </div>
            );
        });

    }

    cleanMenu(item) {
        item.check = false;
        this.update();
    }

    render() {
        return (
            <div style={{ lineHeight: '2.3' }}>
                {this.renderSelected()}
                {this.renderMainMenus(this.state.menus)}
            </div>
        );
    }

}