var React = require('react');
var classNames = require('classnames');
var render = require('../../lib/render.jsx');
var Binding = require('../../lib/binding.jsx');

var Link = require('../../components/link/link.jsx');

var Positionable = require('./positionable.jsx');
var Generator = require('./blocks/generator');

var Project = React.createClass({

  mixins: [Binding],

  getInitialState: function() {
    return {
      content: [],
      currentElement: -1,
      showAddMenu: false
    };
  },

  render: function () {
    var positionables = this.formPositionables(this.state.content);
    var editBtnClass = classNames({
      edit: true,
      active: this.state.currentElement >= 0 && !this.state.showAddMenu
    });

    // Temporary
    var linkData = '';
    if (this.state.currentElement >= 0) {
      linkData = '#' + this.state.content[this.state.currentElement].type;
    }

    return <div id="project" className="demo">
      <div className="pages-container">
        <div className="page next top" />
        <div className="page next right" />
        <div className="page next bottom" />
        <div className="page next left" />
        <div className="page">
          <div className="inner">
            <div ref="container" className="positionables">{ positionables }</div>
          </div>
        </div>
      </div>

      <div className={classNames({overlay: true, active: this.state.showAddMenu})}/>

      <div className={classNames({'controls': true, 'add-active': this.state.showAddMenu})}>
        <div className="add-menu">
          <button className="text" onClick={this.addText}><img className="icon" src="../../img/text.svg" /></button>
          <button className="image" onClick={this.addImage}><img className="icon" src="../../img/camera.svg" /></button>
          <button className="link" onClick={this.addLink}><img className="icon" src="../../img/link.svg" /></button>
        </div>
        <button className="add" onClick={this.toggleAddMenu}></button>
        <button className="delete" onClick={this.deleteElement} hidden={this.state.currentElement===-1}>
          <img className="icon" src="../../img/trash.svg" />
        </button>
        <Link
          className={editBtnClass}
          url={'/projects/123/elements/' + this.state.currentElement + linkData}
          href={'/pages/editor' + linkData}>
          <img className="icon" src="../../img/brush.svg" />
        </Link>
      </div>
    </div>
  },

  componentDidMount: function() {
    this.dims = this.refs.container.getDOMNode().getBoundingClientRect();
  },

  deleteElement: function() {
    if(this.state.currentElement === -1) return;
    var content = this.state.content;
    content.splice(this.state.currentElement,1);
    this.setState({
      content: content,
      currentElement: -1
    });
  },

  toggleAddMenu: function () {
    this.setState({showAddMenu: !this.state.showAddMenu});
  },

  formPositionables: function(content) {
    return content.map((m, i) => {
      var element = Generator.generateBlock(m);
      m.parentWidth = this.dims.width;
      m.parentHeight = this.dims.height;
      return <div>
        <Positionable ref={"positionable"+i} key={"positionable"+i} {...m} current={this.state.currentElement===i} onUpdate={this.updateElement(i)}>
          {element}
        </Positionable>
      </div>;
    });
  },

  updateElement: function(index) {
    return function(data) {
      var content = this.state.content;
      var entry = content[index];
      Object.keys(data).forEach(k => entry[k] = data[k]);
      this.setState({ currentElement: index });
    }.bind(this);
  },

  append: function(obj) {
    this.setState({
      content: this.state.content.concat([obj]),
      showAddMenu: false
    });
  },

  addLink: function() {
    this.append(Generator.generateDefinition(Generator.LINK, {
      href: "https://webmaker.org",
      label: "webmaker.org",
      active: false
    }));
  },

  addText: function() {
    this.append(Generator.generateDefinition(Generator.TEXT, {
      value: "This is a paragraph of text"
    }));
  },

  addImage: function() {
    this.append(Generator.generateDefinition(Generator.IMAGE, {
      src: "../../img/toucan.svg",
      alt: "This is Tucker"
    }));
  },

  save: function() {
    return JSON.stringify(this.state.content);
  },

  saveToString: function() {
    prompt("Content data:", this.save())
  },

  load: function(content) {
    this.setState({
      content: content
    }, function() {
      console.log("restored state");
    });
  },

  loadFromString: function() {
    var data = prompt("Content data:");
    try {
      var content = JSON.parse(data);
      this.load(content);
    } catch (e) {
      console.error("could not parse data as JSON");
    }
  }
});

// Render!
render(Project);
