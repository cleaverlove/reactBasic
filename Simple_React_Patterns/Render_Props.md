#Render Props

这是另一种被使用广泛的从视图中分离逻辑的模式。[React Props](https://reactjs.org/docs/render-props.html)（作为Children或者Function被所知）。一些人信赖它，还有人认为它是anti-pattern。下面就介绍如何将`DagobahRP`组件的逻辑部分用Render Prop的方法执行
```js
class DagobahRp extends React.Component {
	state = { loading: true };

	componentDidMount() {
		fetch("https://swapi.co/api/planets/5")
		.then(res => res.json())
		.then(
			planet => this.setState({ loading: false, planet }),
			error => this.setState({ loading: false, error })
		);
	}

	render() {
		return this.props.render(this.state);
	}
}
//注意: 一个函数被传递通过render prop
export default () => (
	<DagobahRP
		render = {({ loading, error, planet }) => {
			if (loading) {
				return <LoadingView />;
			} else if (planet) {
				return <PlanetView {...planet} />;
			} else {
				return <ErrorView />;
			}
		}}
	/>
);
```
作者的观点认为HOCs和Render Prop都是可以使用的，根据自己的判断，什么时候使用更好。

作者第一次见到Render Props模式是在[React Motion library](https://github.com/chenglou/react-motion). [React Router v4](https://reacttraining.com/react-router/web/api/Route/render-func)是另一个如此实施的库，同时这两个库的作者都在其他一些库中使用这种模式。

作者写的Branching Render Props 变型:


```js
class DagobahRP extends React.Component {
	state = { loading: true };

	componentDidMount() {
		fetch("https://swapi.co/api/planets/5")
		.then(res => res.json())
		.then(
			planet => this.setState({ loading: false, planet }),
        	error => this.setState({ loading: false, error })
		);
	}

	render() {
		if (this.state.loading) {
			return this.props.renderLoading();
		} else if (this.state.planet) {
			return this.props.renderPlanet(this.state.planet);
		} else {
			return this.props.renderError(this.state.error);
		} 
	}
}
//为不同的分支使用不同的回调
export default () => {
	<DagobahRP
	    renderLoading={() => <LoadingView />}
	    renderError={error => <ErrorView />}
	    renderPlanet={planet => <PlanetView {...planet} />}
	/>
};
```
##副作用的代价很大又怎么样呢？
这里应该是指：重复从远程拿同样的数据这个操作。
大多数情况下，逻辑部分都是在HOC或者Render Props会导致编码的代价高，应该要避免。大多数情况下我们只需要拿数据仅仅一次，然后通过HOCs或者render props去传给纯组件，那么要如何做呢？ 下面提到 Provider Pattern