import React from 'react';

export default class Step extends React.Component {

    renderStepItem(item, i) {
        if (item.type) {
            return <div key={i} className={"step-divider " + (item.active ? 'active' : '')} />;
        }

        return (
            <div className={"step-item " + (item.active ? 'active' : '')} key={i}>
                <i className={"" + item.icon} />
                <div className="title">{item.label}</div>
            </div>
        );
    }

    render() {

        if (!this.props.items) return null;
        let rItems = [];
        let items = this.props.items;
        for (var i = 0; i < items.length; i++) {
            let active = this.props.currentStep >= i;
            if (i !== 0) rItems.push({ type: 1, active: active });
            items[i].active = active;
            rItems.push(items[i]);
        }

        return (
            <div className="step-container">
                <div style={{ display: 'flex', alignItems: 'top' }}>
                    <style>
                        {`
.step-container{
    padding:55px;
}

.step-item {
    flex-direction:column;
    display: flex;
    position: relative;
    align-items: center;
}

.step-item .icon{
    background: #eee;
    padding: 8px;
    border-radius: 20px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;   
}

.step-item .title{
    position: absolute;
    top: 40px;
    text-align: center;
    min-width: 120px;
}
.step-item.active .icon{
    background-color: #2185d0;
    color:white;
}

.step-divider{
    background: #eeeeee;
    flex-grow: 1;
    margin-top: 18px;
    height: 4px;
}
.step-divider.active{
    background: #2185d0;
}

                    `}
                    </style>
                    {
                        rItems.map((item, i) => this.renderStepItem(item, i))
                    }
                </div>
                <div style={{ display: 'flex', alignItems: 'top', justifyContent: "space-between" }}>
                    {
                        //items.map((item, i) => <div>{item.label}</div>)
                    }
                </div>
            </div>
        );
    }
}