
#简单日常使用的模式
参考文章: [Simple React Patterns](http://lucasmreis.github.io/blog/simple-react-patterns/)
每天我们会写大量的要么是视图组件要么是组件里面有一些逻辑。这是第一个模式，也是最简单的一个。

##普通或者混合模式

```js
export default class Dagobah extends React.Component {
	//State:
	// { loading: true }
	// { loading: false, planet: { name, climate, terrain } }
	// { loading: false, error: any }
	state = { loading: true };

	componentDidMount() {
		fetch("https://swapi.co/api/planets/5")
		.then(res => res.json())
		.then(
			planet => this.setState({ loading: false, planet }),
			error => this.setState({ loading: false, error });
		)
	}

	renderLoading() {
		return <div>Loading...</div>;
	}

	renderError() {
		return <div> I'm sorry! Plase try again.</div>;
	}

	renderPlanet() {
		const { name, climate, terrain } = this.state.planet;
		return (
			<div>
		        <h2>{name}</h2>
		        <div>Climate: {climate}</div>
		        <div>Terrain: {terrain}</div>
		    </div>
		);
	}

	render() {
		if (this.state.loading) {
			return this.renderLoading();
		} else if (this.state.planet) {
			return this.renderPlanet();
		} else {
			return this.renderError();
		}
	}
}

```
这是一个普通的react组件，想这样写组件的优势是: 很容易去写并且是自包含的。组件`<Dagobah />`可以放在App的任何地方，获取和渲染数据。
注意：全文作者是注重在简单的Loading/Error/Success的这三种状态下
这么做也是有缺点的: 如果想要被很好的复用，这么写明显是不好的。又或者没有数据时，要测试该组件就运行不起来了。
因此要将逻辑和视图(UI渲染)部分分离开，就可以尽量使用第二种模式。

##容器/视图 模式

```js
class PlanetView extends React.Component {
	
	renderLoading() {
		return <div>Loading...</div>;
	}

	renderError() {
    	return <div>I'm sorry! Please try again.</div>;
  	}

  	renderPlanet() {
    	const { name, climate, terrain } = this.props.planet;
	    return (
	      <div>
	        <h2>{name}</h2>
	        <div>Climate: {climate}</div>
	        <div>Terrain: {terrain}</div>
	      </div>
	    );
  	}

  	render() {
  		if (this.props.loading) {
  			return this.renderLoading();
  		} else if (this.props.planet) {
  			return this.renderPlanet();
  		} else {
  			return this.renderError();
  		}
  	}
}

class DagobahContainer extends React.Component {
	state = { loading: true };

	componentDidMount() {
		fetch("https://swapi.co/api/planets/5")
		.then(res => res.json())
		.then(
			planet => this.setState({ loading: false, planet }),
			error => this.setState({ loading:false, error })
		)
	}

	render() {
		return <PlanetView {...this.state} />;
	}
}

export default DogobahContainer;
```
这是一个纯组件和一个在render方法调用纯组件的逻辑组件。
我们可以很容易使用纯组件通过提供不同的props渲染不同的数据，也可以很容易使用[Enzyme](https://github.com/airbnb/enzyme)去测试视图。
作者的经验标明: 可能某一个视图的数据很多，那么可以通过一个纯组件来直接展示它，而在逻辑部分我们可以更好的理解并且当改变代码时，不会污染相关的视图。
注意到纯组件有`if`逻辑部分去定义渲染那一部分。也可以提取成一个单独的组件，就变成一个 容器/视图模式的变体。

## 容器/分支/视图模式

```js
const LoadingView = () => <div>Loading...</div>;

const ErrorView = () => <div>I'm sorry! Please try again.</div>;

const PlanetView = ({ name, climate, terrain }) => (
	<div>
	    <h2>{name}</h2>
	    <div>Climate: {climate}</div>
	    <div>Terrain: {terrain}</div>
	</div>
);

const PlanetBranch = ({ loading, planet }) => {
	if (loading) {
		return <LoadingView />;
	} else if (planet) {
		return <PlanetView {...planet} />;
	} else {
		return <ErrorView />;
	}
}

class DagobahContainer extends React.Component {
	state = { loading: true };

	componentDidMount() {
		fetch("https://swapi.co/api/planets/5")
		.then(res => res.json())
		.then(
			planet => this.setState({ loading: false, planet }),
        	error => this.setState({ loading: false, error })
		)
	}

	render() {
		return <PlanetBrach {...this.state} />;
	}

	export default DagobahContainer;
}
```
现在独立的组件变得更加隔离开了，可以帮助更好的测试展示等。
只有一种情况现在我们现在讨论的模式是不管用的，那就是我们需要`在不同组件中复用相同的逻辑`,目前有两种主要的方式去处理。 以下[Higher_Order_Components.md](https://github.com/airbnb/enzyme)