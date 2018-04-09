#The Provider Pattern

 这个是React最强大的模式之一。相对而言比较简单:获取你要的数据，存入React context对象，然后在HOC(或者Render Prop)获取context object，接着将它作为prop传给预期的组件. 
 [官方文档](https://github.com/ctrlplusb/react-sizeme)

 开始实施Dagobah例子，首先需要要一个`DagobahProvider`

```js
import React from 'react';
import PropTypes from 'prop-types';

//注意: 我们需要定义childContextTypes能够在React中获取到context对象
const contextTypes = {
	dagobah: ProTypes.shape({
		loading: PropTypes.bool,
		error: PropTypes.object,
		planet: PropTypes.shape({
			name: PropTypes.string,
			climate: PropTypes.string,
			terrain: PropTypes.string
		})
	})
}

export class DagobahProvider extends React.Component {
	state = { loading: true };

	componentDidMount() {
		fetch("https://swapi.co/api/planets/5")
	    	.then(res => res.json())
	      	.then(
	        	planet => this.setState({ loading: false, planet }),
	        	error => this.setState({ loading: false, error })
	        );
	}

	static childContentTypes = contextTypes;

	getChildContext() {
		return { dagobah: this.state };
	}

	render() {
		return this.props.children;
	}
}
```
provider使用前面一样的逻辑在`componentDidMount`方法中。不同的地方在于添加了`dagobah`属性到context object通过`getChildContext`方法。渲染它的children通过返回children props在render方法中。

现在，任何在provider下的组件可以获取context中的`dagoba`对象。但是在组件中获取context是一个不好的实践。执行HOC去获取context然后注入`dagobah`对象在一个组件的props上

```js
const withDagobah = PlanetViewComponent => 
	class extends React.Component {
		static contextTypes = contextTypes;

		render() {
			const { props, context } = this;
			return <PlanetViewComponent {...props} {...context.dagobah} />;
		}
	}
```
注意`contextTypes`属性: 我们需要它被用provider的相同映射定义来获取context，可以在任何组件传递，这样我们可以随意使用`withDagobah`来渲染视图，而且数据我们只需拿一次。

当然，我们需要获取context通过Render Props
```js
const DagobahRp = ({ render }, { dagobah }) => render(dagobah);

DagobahRp.contextTypes = contextTypes;

```
非常简单，我们可以在我们的应用中使用
```js
const DagobahPlanet = withDagobah(View);

class App extends Component {
	render() {
		return (
			<DagobahProvider>
				<DagobahPlanet />
				<DagobahPlanet />
				<DagobahPlanet />
				<DagobahRp render={props => <View {...props} />} />
				<DagobahRp render={props => <View {...props} />} />
				<DagobahRp render={props => <View {...props} />} />
			</DagobahProvider>
		);
	}
}
```
Dagobah被渲染六次，数据只需获取一次。

很多的库都使用了Provider pattern,包括前面提到的react-redux和React Router v4. 并且[React-intl](https://github.com/yahoo/react-intl)也是使用这个模式的例子。