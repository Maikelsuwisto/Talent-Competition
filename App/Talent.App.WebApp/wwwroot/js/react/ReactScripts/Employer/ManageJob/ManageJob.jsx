import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Segment, Button, Table, Grid } from 'semantic-ui-react';

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);
        let loader = loaderData
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");
        //console.log(loader)
        this.state = {
            loadJobs: [],
            loaderData: loader,
            sortBy: {
                date: "desc"
            },
            filter: {
                showActive: true,
                showClosed: false,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            currentPage: 1,
            jobsPerPage: 3
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        this.sortAscending = this.sortAscending.bind(this);
        this.sortDescending = this.sortDescending.bind(this);
        this.setPageNum = this.setPageNum.bind(this);
        //your functions go here
    };

    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData)
        loaderData.isLoading = false;
        this.setState({ loaderData });//comment this

        //set loaderData.isLoading to false after getting data
        //this.loadData(() =>
        //    this.setState({ loaderData })
        //)

        //console.log(this.state.loaderData)
    }

    componentDidMount() {
        this.loadData();
    };

    loadData() {
        //var link = 'http://localhost:51689/listing/listing/getSortedEmployerJobs';
        var cookies = Cookies.get('talentAuthToken');
        // your ajax call and other logic goes here
        $.ajax({
            url: 'http://localhost:51689/listing/listing/getEmployerJobs',
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            success: function (res) {
                if (res.myJobs) {
                    this.setState({ loadJobs: res.myJobs })
                    console.log("loadJobs", res.myJobs)
                }
            }.bind(this),
            error: function (res) {
                console.log(res.status)
            }
        })
        this.init()
    }

    loadNewData(data) {
        var loader = this.state.loaderData;
        loader.isLoading = true;
        data[loaderData] = loader;
        this.setState(data, () => {
            this.loadData(() => {
                loader.isLoading = false;
                this.setState({
                    loadData: loader
                })
            })
        });
    }

    sortAscending() {
        const { loadJobs } = this.state;
        loadJobs.sort((a, b) => a - b)
        this.setState({ loadJobs })
    }

    sortDescending() {
        const { loadJobs } = this.state;
        loadJobs.sort((a, b) => a - b).reverse()
        this.setState({ loadJobs })
    }

    setPageNum(event, { activePage }) {
        this.setState({ currentPage: activePage });
    };

    render() {
        const { loadJobs, currentPage, jobsPerPage } = this.state
        const indexOfLastPage = currentPage * jobsPerPage;
        const indexOfFirstPage = indexOfLastPage - jobsPerPage;
        const currentJobs = loadJobs.slice(indexOfFirstPage, indexOfLastPage)

        const pageNumbers = Math.ceil(loadJobs.length / jobsPerPage)

        return (
            <BodyWrapper reload={this.loadData} loaderData={this.state.loaderData}>
                <div className="ui container">
                    <h1>List Of Jobs</h1>
                    <Dropdown text='Filter: Choose Filter' icon='filter' floating labeled className='icon' >
                        <Dropdown.Menu>
                            <Dropdown.Item>Show Active</Dropdown.Item>
                            <Dropdown.Item>Show Close</Dropdown.Item>
                            <Dropdown.Item>Show Draft</Dropdown.Item>
                            <Dropdown.Item>Show Expired</Dropdown.Item>
                            <Dropdown.Item>Show Unexpired</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown text='Sort by date' icon='calendar alternate outline' floating labeled className='icon' >
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={this.sortAscending}>Newest First</Dropdown.Item>
                            <Dropdown.Item onClick={this.sortDescending}>Older First</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Grid columns={1} padded>
                        {loadJobs ? currentJobs.map(jobs =>
                            <Grid.Column key={jobs.id}>
                                <Segment>
                                    <h3>{jobs.title}</h3> <br />
                                    {jobs.location.city}, {jobs.location.country} <br />
                                    {jobs.summary}<br /><br /><br /><br /><br />
                                    <Button color='red'>Expired</Button>
                                    <Button.Group floated='right'>
                                        <Button basic color='blue' icon='close' content='Close' />
                                        <Button basic color='blue' icon='edit' content='Edit' />
                                        <Button basic color='blue' icon='clipboard outline' content='Copy' />
                                    </Button.Group>
                                </Segment> </Grid.Column>) :
                            <Segment>
                                <Grid.Column>No Jobs Found</Grid.Column>
                            </Segment>
                        }
                    </Grid>
                    <Pagination
                        boundaryRange={0} activePage={currentPage} totalPages={pageNumbers} siblingRange={1} onPageChange={this.setPageNum} floated="right"
                    />
                </div>
            </BodyWrapper>
        )
    }
}
