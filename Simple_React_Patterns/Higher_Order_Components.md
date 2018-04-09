 #高阶组件
 高阶组件(HOCs)是至少接受一个组件作为参数并返回另一个组件的简单函数。通常通过给传入的组件添加属性(props)，例如我们有一个`widthDagobah`高阶组件获取关于Dagobah的数据并且将结果作为prop传递下去。

 ```js
const withDagobah = PlanentViewComponent => 
	class extends React.Component {
		state = { loading: true };

		componentDidMount() {
			fetch("https://swapi.co/api/planents/5")
			.then(res => res.json())
			.then(
				planet => this.setState({ loading: false, planet }),
				error => this.setState({ loading: false, error })
			);
		}

		render() {
			return <PlanetViewComponent {...this.state} />;
		}
	};

export default withDagobah(PlanetBranch);
 ```
 现在，获取数据的逻辑在HOC里面，没有和任何特别的React视图绑定在一起，仅仅是通过给传入的组件添加props。 这样我们可以在任何路由使用来渲染不同的组件。

注意: 如果你使用如上的HOC在两个渲染一样的UI的组件，那么会有重复获取两次，获取数据会是一个昂贵的副作用，因此尽量减少。下面作者会讨论最后一个模式来处理这个问题。

HOC也可以接受不同的参数去定义它的行为，例如我们可以有一个withPlanet高阶组件接受不同的行星

```js
const hoc = withPlanet('tatooine'); //塔图因星
const Tatooine = hoc(PlanetView);

// somewhere else inside a component:

render() {
	return (
		<div>
			<Tatooine />
		</div>
	);
}
```
一个关于高阶组件根据不同参数去定义行为的例子是[react-sizeme](https://github.com/ctrlplusb/react-sizeme). 它接受一个对象选项，一个组件，同时返回另一个带有`size`属性包括宽高，位置信息的组件。
上面的HOCS不好的地方是每一个被使用了HOC的视图，不得不理解传递的props的形状。在本文例子中，有`loading`,`error`,`planet`三个组件是必须的，有时候，某个组件的目的仅仅是转换props达到预期的样子，同时保持高效（有趣的是经常我们使用的HOCs没有这个问题:[react-redux](https://github.com/ctrlplusb/react-sizeme)'s`connect`，因为使用者可以决定形状通过传递给组件的props）

`withDaagobah`几乎总是被`Loading`，`Error`,`Success`视图渲染，可以得到一个HOC变体:

##变形: 分支高阶组件
我们可以将逻辑分支放入HOC里面:
```js
const withDagobah = ({
	LoadingViewComponent,
	ErrorViewComponent,
	PlanetViewComponent
}) => 
	class extends React.Component {
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
		        return <LoadingViewComponent />;
		    } else if (this.state.planet) {
		        return <PlanetViewComponent {...this.state.planet} />;
		    } else {
		        return <ErrorViewComponent />;
		    }
		}
	}

// HOC类似如下调用
export default withDagobah({
	LoadingViewComponent: LoadingView,
	ErrorViewComponent: ErrorView,
	PlanetViewComponent: PlanetView
});
```
一个分支HOC的例子是[react-loadable](https://github.com/ctrlplusb/react-sizeme),不仅接受动态的loaded组件而且接受一个Loading组件，同时控制着loading和error状态。