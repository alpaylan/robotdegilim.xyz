import axios from "axios";

export class Client{
    constructor() {
        const cacheBuster = Math.random().toString(36).substring(2, 15);

        // @todo: Push these into S3 CDN
        this.coursesUrl = "https://raw.githubusercontent.com/erenerisken/robotdegilim.xyz/master/doldur-backend/data.json?cb=" + cacheBuster;
        this.lastUpdatedUrl = "https://raw.githubusercontent.com/erenerisken/robotdegilim.xyz/master/doldur-backend/last_updated.json?cb=" + cacheBuster;
        this.mustUrl = "https://raw.githubusercontent.com/erenerisken/robotdegilim.xyz/master/doldur-backend/musts.json?cb=" + cacheBuster;
    }
    async getLastUpdated() {
        const data = (await axios.get(this.lastUpdatedUrl)).data;
        console.log("Last updated = " + data.lastUpdated);
        return data.lastUpdated;
    }
    async getMusts(dept, semester){
        const data = (await axios.get(this.mustUrl)).data;
        console.log(data);
        return data[dept][semester.toString()];
    }
    async getCourses(){
        const data = (await axios.get(this.coursesUrl)).data;
        const courses = Array(0);
        // eslint-disable-next-line
        Object.keys(data).map(code => {
            const courseToPush = {
                code: code,
                abbreviation: data[code]["Course Name"].slice(0, data[code]["Course Name"].search(" ")),
                name: data[code]["Course Name"].slice(data[code]["Course Name"].search("-")+2),
                category: 0,
                sections: Array(0)
            };
            const sectionNumbers = Object.keys(data[code]["Sections"]);
            // eslint-disable-next-line
            sectionNumbers.map(sn => {
                const s = data[code]["Sections"][sn];
                const sectionToPush = {
                    instructor: s["i"][0],
                    sectionNumber: sn,
                    criteria: Array(0),
                    minYear: 0,
                    maxYear: 0,
                    lectureTimes: Array(0)
                };
                // eslint-disable-next-line
                s["t"].map(t => {
                    sectionToPush.lectureTimes.push({
                        classroom: t["p"],
                        day: t["d"],
                        startHour: parseInt(t["s"].slice(0, t["s"].search(":"))),
                        startMin: parseInt(t["s"].slice(t["s"].search(":")+1)),
                        endHour: parseInt(t["e"].slice(0, t["e"].search(":"))),
                        endMin: parseInt(t["e"].slice(t["e"].search(":")+1)),
                    });
                });
                // eslint-disable-next-line
                s["c"].map(c => {
                    sectionToPush.criteria.push({
                        dept: c["d"],
                        surnameStart: c["s"],
                        surnameEnd: c["e"]
                    });
                });
                courseToPush.sections.push(sectionToPush);
            });
            //console.log(courseToPush);
            //console.log(data[code]);
            courses.push(courseToPush);
        });
        return courses;
    }
}
