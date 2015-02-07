var Router = ReactRouter;

var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var App = React.createClass({
  render: function () {
    return (
      <div>
        <Header />
        <RouteHandler />
      </div>
    );
  }
});


var data = [
  {"name": "Station 1", "shortcode": "ST1"},
  {"name": "Station 2", "shortcode": "ST2"}
];

var StationList = React.createClass({
  render: function() {
	var stationOptions = this.props.data.map(function (station) {
	    return (
	        <Station shortcode={station.shortcode}>
	          {station.name}
	        </Station>
	      );
	    });
    return (
      <select className="stationList" ref="{this.props.ref}">
      <option value="0">Select a station</option>
        {stationOptions}
      </select>
    );
  }
});


var Station = React.createClass({
  render: function() {
    return (
      <option className="station" value={this.props.shortcode}>
        {this.props.children}
      </option>
    );
  }
});

var StationForm = React.createClass({
	handleSubmit: function(e) {
	    e.preventDefault();
	    var fromShortcode = this.refs.from.getDOMNode().value.trim();
	    var toShortcode = this.refs.to.getDOMNode().value.trim();
	    if (fromShortcode == 0 || toShortcode == 0) {
	      return;
	    }
	   	this.props.onStationSubmit({from: fromShortcode, to: toShortcode});
  },
  render: function() {
    return (
		<form className="stationForm" onSubmit={this.handleSubmit}>
		<StationList data={this.props.data} ref="from" />
        <StationList data={this.props.data} ref="to" />
        <input type="submit" value="Let's bet!" />
      </form>
    );
  }
});

var liveStationData;
var StationBox = React.createClass({
  loadStationsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadStationsFromServer();
    liveStationData = setInterval(this.loadStationsFromServer, this.props.pollInterval);
  },
  handleStationSubmit: function(stations) {
    console.log(stations);
    $.ajax({
      url: "odds.json", //Odds data is currently static - Always 0.7 (0 is "Never been late" and 1 is "Never been on time")
      dataType: 'json',
      success: function(data) {
        console.log(data);
        clearInterval(liveStationData);
        window.location.href = "/#/odds"; //Next step: To pass through data to the 'Odds' view.
      }.bind(this),
      error: function(xhr, status, err) {
        console.error("odds.json", status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
      <div className="stationBox">
        <StationForm onStationSubmit={this.handleStationSubmit} data={this.state.data} />
      </div>
    );
  }
});
var Header = React.createClass({
	render: function() {
		return (
	        <div className="header">

	        <h1>Late Trains!</h1>
	        <h2>Putting the 'fun' into 'fundamentally late for a very important meeting!'</h2>

	        </div>
		);
	}
});
var Content404 = React.createClass({
	render: function() {
		return (
	        <div className="404">404</div>
		);
	}
});
var Home = React.createClass({
	render: function() {
		return (
	        <StationBox url="stations.json" pollInterval={2000} />
		);
	}
});
var Odds = React.createClass({
	render: function() {
		return (
	        <div className="odds">Odds are</div>
		);
	}
});

var routes = (
  <Route name="app" handler={App} path="/">
    <DefaultRoute handler={Home} />
    <Route name="odds" handler={Odds} />
  </Route>
);
Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.getElementById('content'));
});
