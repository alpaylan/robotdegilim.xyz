import React from "react";
import {
    TextField,
    Select,
    Button,
    FormControl,
    FormHelperText,
    MenuItem,
    InputLabel,
    Snackbar,
    Divider
} from "@material-ui/core";
import MuiAlert from '@material-ui/lab/Alert';
import AddIcon from '@material-ui/icons/Add';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import {isMobile} from "react-device-detect";

import {getAllCourses, getMusts} from "./data/Course";
import {CourseCard} from "./CourseCard";
import {AddCourseWidget} from "./AddCourseWidget";
import {AdvancedSettings} from "./AdvancedSettings";
import {Colorset} from "./Colorset";

import "./Controls.css"

export class Controls extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            surname: "",
            department: "",
            semester: 0,
            alertMsg: "",
            errorDept: false,
            errorSemester: false,
            selectedCourses: [],
            allCourses: [],
            settings: {
                checkSurname: true,
                checkDepartment: true,
                checkCollision: true
            },
            scenarios: [],
            colorset: new Colorset()
        }
    }
    componentDidMount() {
        document.title = "Robot Değilim *-*";
        getAllCourses().then(data => this.setState({allCourses: data}));
        if (isMobile){
            document.body.style.zoom = "60%";
        }
    }

    getCourseByCode(code){
        for (let i = 0; i<this.state.allCourses.length; i++){
            if (this.state.allCourses[i].code === code){
                return this.state.allCourses[i];
            }
        }
        return null;
    }

    renderSemesterSelections(n){
        const ret = Array(0);
        ret.push(<MenuItem value={0}>---</MenuItem> )
        for (let i = 0; i<n; i++){
            ret.push(<MenuItem value={i+1}>{i+1}</MenuItem> );
        }
        return ret;
    }

    handleAddMustCourse(){
        this.setState({alertMsg: "", errorDept: false, errorSemester: false});
        if (this.state.department.length < 2){
            this.setState({alertMsg: "Please enter a correct department", errorDept: true});
            return;
        }
        if (this.state.semester < 1){
            this.setState({alertMsg: "Please choose a semester", errorSemester: true});
            return;
        }
        getMusts(this.state.department, this.state.semester).then(data => {
            if (data !== undefined){
                // eslint-disable-next-line
                data.map(code => {
                    this.handleAddCourse(this.getCourseByCode(code));
                });
            }
        })
    }

    handleAlertClose(){
        this.setState({alertMsg: ""});
    }
    handleDeleteCourse(i){
        const newSelectedCourses = this.state.selectedCourses.slice(0);
        newSelectedCourses[i] = null;
        this.setState({selectedCourses: newSelectedCourses});
    }
    handleToggle(i, sections){
        const newSelectedCourses = this.state.selectedCourses.slice(0);
        newSelectedCourses[i].sections = sections;
        this.setState({selectedCourses: newSelectedCourses});
        console.log("Course " + i + " sections:" + sections);
    }
    handleAddCourse(c){
        const newSelectedCourses = this.state.selectedCourses.slice(0);
        newSelectedCourses.push({
            code: c.code,
            sections: Array(c.sections.length).fill(true),
            color: this.state.colorset.getNextColor()
        });
        this.setState({selectedCourses: newSelectedCourses});
    }
    handleChangeSettings(s){
        this.setState({settings: s});
    }
    handleScheduleBegin(){
        const courseData = Array(0);
        // eslint-disable-next-line
        this.state.selectedCourses.map(c => {
            if (c === null){
                return null;
            }
            const currentCourse = this.getCourseByCode(c.code);
            const courseToPush = {
                code: c.code,
                category: currentCourse.category,
                checkSurname: this.state.settings.checkSurname,
                checkCollision: this.state.settings.checkCollision,
                checkDepartment: this.state.settings.checkDepartment,
                sections: Array(0)
            };
            for(let i = 0; i<currentCourse.sections.length; i++){
                const sectionToPush = {
                    minYear: currentCourse.sections[i].minYear,
                    maxYear: currentCourse.sections[i].maxYear,
                    toggle: c.sections[i],
                    dept: currentCourse.sections[i].dept,
                    surnameStart: currentCourse.sections[i].surnameStart,
                    surnameEnd: currentCourse.sections[i].surnameEnd,
                    lectureTimes: Array(0)
                };
                currentCourse.sections[i].lectureTimes.map(t => sectionToPush.lectureTimes.push(t));
                courseToPush.sections.push(sectionToPush);
            }
            courseData.push(courseToPush);
        });
        console.log(courseData);
    }
    render() {
        return (
            <div className={isMobile ? "control-mobile" : "control-wrapper"}>
                <Snackbar
                    open={this.state.alertMsg !== ""}
                    autoHideDuration={5000}
                    onClose={() => this.handleAlertClose()}
                >
                    <MuiAlert elevation={6} variant={"filled"} onClose={() => this.handleAlertClose()} severity={"error"}>
                        {this.state.alertMsg}
                    </MuiAlert>
                </Snackbar>
                <div className={"control-row"}>
                    <div className={"textfield-wrapper"}>
                        <TextField
                            required
                            label={"Surname"}
                            value={this.state.surname}
                            inputProps={{ maxLength: 12 }}
                            variant={"outlined"}
                            onChange={e => this.setState({surname: e.target.value.toUpperCase()})}
                        />
                    </div>
                    <div className={"textfield-wrapper"}>
                        <TextField
                            required
                            error={this.state.errorDept}
                            label={"Department"}
                            value={this.state.department}
                            inputProps={{ maxLength: 12 }}
                            variant={"outlined"}
                            onChange={e => this.setState({department: e.target.value.toUpperCase()})}
                        />
                    </div>
                </div>
                <div className={"control-row"}>
                    <div className={"textfield-wrapper"}>
                        <FormControl className={"form-control"}>
                            <InputLabel>Semester</InputLabel>
                            <Select
                                error={this.state.errorSemester}
                                value={this.state.semester}
                                onChange={e => this.setState({semester: e.target.value})}
                            >
                                {this.renderSemesterSelections(8)}
                            </Select>
                            <FormHelperText>Ex: 2nd year Fall semester -> 3</FormHelperText>
                        </FormControl>
                    </div>
                    <div className={"control-button"}>
                        <Button
                            variant={"contained"}
                            color={"secondary"}
                            startIcon={<AddIcon />}
                            onClick={() => this.handleAddMustCourse()}>
                            Add Must Courses
                        </Button>
                    </div>
                    <div className={"control-button"}>
                        <Button
                            variant={"contained"}
                            color={"primary"}
                            startIcon={<EventAvailableIcon />}
                            onClick={() => this.handleScheduleBegin()}>
                            Schedule
                        </Button>
                    </div>
                </div>
                <AdvancedSettings settings={this.state.settings} onSettingsChange={s => this.handleChangeSettings(s)}/>
                <Divider />
                <div className={"control-row"}>
                    <div className={"centered-row"}>
                        Added Courses
                    </div>
                </div>
                <Divider />
                {this.state.selectedCourses.map((c, i) => {
                    return (
                        c !== null?
                        <CourseCard course={this.getCourseByCode(c.code)}
                                    onDelete={() => this.handleDeleteCourse(i)}
                                    onToggle={sections => this.handleToggle(i, sections)}
                                    color={c.color}/> : null
                    );
                })}
                <AddCourseWidget
                    courses={this.state.allCourses}
                    onCourseAdd={c => this.handleAddCourse(c)}/>
            </div>
        )
    }
}