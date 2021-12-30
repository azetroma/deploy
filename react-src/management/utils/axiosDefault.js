import Axios from "axios";
import $ from 'jquery';

export default function setAxiosDefault() {
     var xsrf = $('input[name=__RequestVerificationToken]').val() //+ 'a';
    Axios.defaults.headers.common['__RequestVerificationToken'] = xsrf;
}
