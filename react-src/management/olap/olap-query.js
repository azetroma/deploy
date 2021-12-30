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
import notify from '../utils/notify';
notify.config();

export default class OlapQuery extends React.Component {
    constructor(p) {
        super(p);
        this.state = {
            processProgress: false,
            error: null,
            formula: '',
            name: ''
        };
        this.list = [];
        //this.list = p.data.Hierarchies.map(function (item) {
        //    return item.UniqueName;
        //});
    }

    componentDidMount() {
        Axios.get(app.urlPrefix + 'api/olap/getDatasources')
            .then(res => {
                _.each(res.data, item => item.dsName = `[id${item.id}-${item.name}]`);
                this.list = res.data;
            });

        if (+this.props.id > 0) {
            this.setState({ progress: true });
            Axios.get(app.urlPrefix + 'api/olap/getCalcTable/' + this.props.id)
                .then(res => {
                    this.setState({ ...res.data });
                    this.setFormula(res.data.formula);
                })
                .catch(e => notify.notifyError())
                .finally(() => this.setState({ progress: false }));
        }

    }
    daxFunctions = [
        'ABS',
        'ACOS',
        'ACOSH',
        'ACOT',
        'ACOTH',
        'ADDCOLUMNS',
        'ADDMISSINGITEMS',
        'ALL',
        'ALLCROSSFILTERED',
        'ALLEXCEPT',
        'ALLNOBLANKROW',
        'ALLSELECTED',
        'AND',
        'APPROXIMATEDISTINCTCOUNT',
        'ASIN',
        'ASINH',
        'ATAN',
        'ATANH',
        'AVERAGE',
        'AVERAGEA',
        'AVERAGEX',
        'BETA.DIST',
        'BETA.INV',
        'BLANK',
        'CALCULATE',
        'CALCULATETABLE',
        'CALENDAR',
        'CALENDARAUTO',
        'CEILING',
        'CHISQ.DIST',
        'CHISQ.DIST.RT',
        'CHISQ.INV',
        'CHISQ.INV.RT',
        'CLOSINGBALANCEMONTH',
        'CLOSINGBALANCEQUARTER',
        'CLOSINGBALANCEYEAR',
        'COMBIN',
        'COMBINA',
        'COMBINEVALUES',
        'CONCATENATE',
        'CONCATENATEX',
        'CONFIDENCE.NORM',
        'CONFIDENCE.T',
        'CONTAINS',
        'CONTAINSROW',
        'CONTAINSSTRING',
        'CONTAINSSTRINGEXACT',
        'CONVERT',
        'COS',
        'COSH',
        'COT',
        'COTH',
        'COUNT',
        'COUNTA',
        'COUNTAX',
        'COUNTBLANK',
        'COUNTROWS',
        'COUNTX',
        'CROSSFILTER',
        'CROSSJOIN',
        'CURRENCY',
        'CURRENTGROUP',
        'CUSTOMDATA',
        'DATATABLE',
        'DATE',
        'DATEADD',
        'DATEDIFF',
        'DATESBETWEEN',
        'DATESINPERIOD',
        'DATESMTD',
        'DATESQTD',
        'DATESYTD',
        'DATEVALUE',
        'DAY',
        'DEGREES',
        'DETAILROWS',
        'DISTINCT',
        'DISTINCTCOUNT',
        'DISTINCTCOUNTNOBLANK',
        'DIVIDE',
        'EARLIER',
        'EARLIEST',
        'EDATE',
        'ENDOFMONTH',
        'ENDOFQUARTER',
        'ENDOFYEAR',
        'EOMONTH',
        'ERROR',
        'EVEN',
        'EXACT',
        'EXCEPT',
        'EXP',
        'EXPON.DIST',
        'FACT',
        'FALSE',
        'FILTER',
        'FILTERS',
        'FIND',
        'FIRSTDATE',
        'FIRSTNONBLANK',
        'FIXED',
        'FLOOR',
        'FORMAT',
        'GCD',
        'GENERATE',
        'GENERATEALL',
        'GENERATESERIES',
        'GEOMEAN',
        'GEOMEANX',
        'GROUPBY',
        'HASONEFILTER',
        'HASONEVALUE',
        'HOUR',
        'IF',
        'IFERROR',
        'IGNORE',
        'INT',
        'INTERSECT',
        'ISBLANK',
        'ISCROSSFILTERED',
        'ISEMPTY',
        'ISERROR',
        'ISEVEN',
        'ISFILTERED',
        'ISINSCOPE',
        'ISLOGICAL',
        'ISNONTEXT',
        'ISNUMBER',
        'ISO.CEILING',
        'ISODD',
        'ISONORAFTER',
        'ISSELECTEDMEASURE',
        'ISSUBTOTAL',
        'ISTEXT',
        'KEEPFILTERS',
        'KEYWORDMATCH',
        'LASTDATE',
        'LASTNONBLANK',
        'LCM',
        'LEFT',
        'LEN',
        'LN',
        'LOG',
        'LOG10',
        'LOOKUPVALUE',
        'LOWER',
        'MAX',
        'MAXA',
        'MAXX',
        'MEDIAN',
        'MEDIANX',
        'MID',
        'MIN',
        'MINA',
        'MINUTE',
        'MINX',
        'MOD',
        'MONTH',
        'MROUND',
        'NATURALINNERJOIN',
        'NATURALLEFTOUTERJOIN',
        'NEXTDAY',
        'NEXTMONTH',
        'NEXTQUARTER',
        'NEXTYEAR',
        'NONVISUAL',
        'NORM.DIST',
        'NORM.INV',
        'NORM.S.DIST',
        'NORM.S.INV',
        'NOT',
        'NOW',
        'ODD',
        'OPENINGBALANCEMONTH',
        'OPENINGBALANCEQUARTER',
        'OPENINGBALANCEYEAR',
        'OR',
        'PARALLELPERIOD',
        'PATH',
        'PATHCONTAINS',
        'PATHITEM',
        'PATHITEMREVERSE',
        'PATHLENGTH',
        'PERCENTILE.EXC',
        'PERCENTILE.INC',
        'PERCENTILEX.EXC',
        'PERCENTILEX.INC',
        'PERMUT',
        'PI',
        'POISSON.DIST',
        'POWER',
        'PREVIOUSDAY',
        'PREVIOUSMONTH',
        'PREVIOUSQUARTER',
        'PREVIOUSYEAR',
        'PRODUCT',
        'PRODUCTX',
        'QUOTIENT',
        'RADIANS',
        'RAND',
        'RANDBETWEEN',
        'RANK.EQ',
        'RANKX',
        'RELATED',
        'RELATEDTABLE',
        'REMOVEFILTERS',
        'REPLACE',
        'REPT',
        'RIGHT',
        'ROLLUP',
        'ROLLUPADDISSUBTOTAL',
        'ROLLUPGROUP',
        'ROLLUPISSUBTOTAL',
        'ROUND',
        'ROUNDDOWN',
        'ROUNDUP',
        'ROW',
        'SAMEPERIODLASTYEAR',
        'SAMPLE',
        'SEARCH',
        'SECOND',
        'SELECTCOLUMNS',
        'SELECTEDMEASURE',
        'SELECTEDMEASUREFORMATSTRING',
        'SELECTEDMEASURENAME',
        'SELECTEDVALUE',
        'SIGN',
        'SIN',
        'SINH',
        'SQRT',
        'SQRTPI',
        'STARTOFMONTH',
        'STARTOFQUARTER',
        'STARTOFYEAR',
        'STDEV.P',
        'STDEV.S',
        'STDEVX.P',
        'STDEVX.S',
        'SUBSTITUTE',
        'SUBSTITUTEWITHINDEX',
        'SUM',
        'SUMMARIZE',
        'SUMMARIZECOLUMNS',
        'SUMX',
        'SWITCH',
        'T.DIST',
        'T.DIST.2T',
        'T.DIST.RT',
        'T.INV',
        'T.INV.2T',
        'TAN',
        'TANH',
        'TIME',
        'TIMEVALUE',
        'TODAY',
        'TOPN',
        'TOPNSKIP',
        'TOTALMTD',
        'TOTALQTD',
        'TOTALYTD',
        'TREATAS',
        'TRIM',
        'TRUE',
        'TRUNC',
        'UNICHAR',
        'UNICODE',
        'UNION',
        'UPPER',
        'USERELATIONSHIP',
        'USERNAME',
        'USEROBJECTID',
        'USERPRINCIPALNAME',
        'UTCNOW',
        'UTCTODAY',
        'VALUE',
        'VALUES',
        'VAR.P',
        'VAR.S',
        'VARX.P',
        'VARX.S',
        'WEEKDAY',
        'WEEKNUM',
        'XIRR',
        'XNPV',
        'YEAR',
        'YEARFRAC',
    ];
    autoComplete = cm => {
        let codeMirror = this.refs['CodeMirror'].getCodeMirrorInstance();
        var list = this.list;
        var daxFunctions = this.daxFunctions;
        codeMirror.registerHelper('hint', 'dictionaryHint', function (editor) {
            var cur = editor.getCursor();
            var curLine = editor.getLine(cur.line);
            var start = cur.ch;
            var end = start;
            var lineBefore = curLine.slice(0, start);

            while (end < curLine.length && /[\-\[\]\.\u0600-\u065F\u066A-\u06EF\u06FA-\u06FFa-zA-Z0-9$]/.test(curLine.charAt(end)))++end;
            while (start && /[\-[\[\]\.\u0600-\u065F\u066A-\u06EF\u06FA-\u06FFa-zA-Z0-9$]/.test(curLine.charAt(start - 1)))--start;

            //lineBefore.replace(/.*?\[.*?\].\[.*?\]/, '');
            //var index = lineBefore.lastIndexOf(/\[\]/);
            //if (index !== -1) {
            //    start = index;
            //}

            var curWord = curLine.slice(start, end);
            console.log(cur, start, end, curLine);
            var name = curWord.replace(/\[id\d+\-(.*?)\].*/, "$1");

            var selectedDs = _.find(list, { name: name });

            curWord = curWord.replace('[', '\\[').replace(']', '\\]').replace('.', '\\.');
            var regex = new RegExp('^.*' + curWord + '.*', 'i');

            var suggest = [];
            if (selectedDs) {
                suggest = selectedDs.columns
                    //.filter(function (item) { return item.dsName.match(regex); })
                    .map(function (i) { return `[id${selectedDs.id}-${selectedDs.name}].[${i.name}]`; })
                    .sort();

            } else {
                suggest = list
                    .filter(function (item) { return item.dsName.match(regex); })
                    .map(function (i) { return i.dsName; })
                    .sort();
                var suggestDax = daxFunctions
                    .filter(function (item) { return item.match(regex); })
                    .sort();
                suggest = suggest.concat(suggestDax);

            }


            return {
                list: suggest,
                from: codeMirror.Pos(cur.line, start),
                to: codeMirror.Pos(cur.line, end)
            };
        });
        codeMirror.showHint(cm, codeMirror.hint.dictionaryHint, { completeSingle: false });
    };

    showError() {
        if (this.state.error)
            return <div className="ui red segment">{this.state.error}</div>;
    }

    setFormula(f) {
        let z = this.refs['CodeMirror'];
        if (z) {
            z.codeMirror.setValue(f);
        }
        this.setState({ formula: f });
    }

    updateCode(newCode) {
        this.setState({ formula: newCode });
    }

    save() {
        this.setState({ saveProgress: true });
        Axios
            .post(app.urlPrefix + 'api/olap/addTable', {
                id: this.state.id,
                name: this.state.name,
                formula: this.state.formula
            })
            .then(res => {
                if (this.props.onchange) this.props.onchange(res.data.model);
                this.setState({ error: res.data.error });
                if (res.data.error) {
                    notify.notifyError();
                } else {
                    notify.notify();
                }
            })
            .catch(error => this.setState({ error: error.response.data.desc }))
            .finally(() => {
                this.setState({ saveProgress: false });
            });

    }

    render() {
        var options = {
            lineNumbers: true,
            lineWrapping: true,
            mode: 'sql',
            extraKeys: {
                'Ctrl-Space': this.autoComplete
            }
        };
        if (this.state.progress) {
            return <div className="ui active centered loader text inline">در حال بارگذاری</div>;
        }
        return (
            <div>
                <style>{`
                        .CodeMirror-hints{
                            z-index:1000;
                            text-align:left;
                            direction: ltr;
                            font-family:IRANSans;
                            line-height:1.9em;
                        }
                     `}</style>
                <div className="ui form">
                    <div className={"field" + (this.props.model ? ' disabled' : '')}>
                        <label>نام جدول</label>
                        <input value={this.state.name || ''} onChange={(e) => this.setState({ name: e.target.value })} />
                    </div>
                    <div className="field" >
                        <label>فرمول</label>
                        <div className="ltr" style={{ textAlign: 'left', border: '1px solid #efefef', borderRadius: '4px' }}>
                            <CodeMirror ref="CodeMirror"

                                className="ltr" value={this.state.formula || ''} onChange={(d) => this.updateCode(d)} options={options} />
                        </div>
                    </div>
                    {this.showError()}
                    <Button className="green" loading={this.state.saveProgress} disabled={this.state.saveProgress} onClick={() => this.save()}>ذخیره</Button>
                </div>
            </div>);
        //{this.props.model && <Button loading={this.state.deleteProgress} disabled={this.state.deleteProgress} className="red" onClick={() => this.delete()} >حذف</Button>}
        //<Button className="black" onClick={() => this.setState({ open: false })} >لغو</Button>

    }

}