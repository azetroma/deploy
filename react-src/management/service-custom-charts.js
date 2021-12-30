import Axios from "axios";

const service = {
    get: () => {
        if (!service.data) {
            service.data = Axios.get(app.urlPrefix + 'api/customcharts/get').then(res => {
                _.sortBy(res.data.list, "category");
                return res.data;
            });
        }
        return service.data;
    },
    data: null
};

export default service;