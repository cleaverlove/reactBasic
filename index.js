
/*  Transformation(变换)  */
function NameBox(name) {
	//调用NameBox方法，同样的输入总是得到同样的输出
	return { fontWeight: 'bold', labelContent: name };
}

//console.log(NameBox('Sebastian Markbage'))

/*  抽象  */
function FancyUserBox(user) {
	return {
		borderStyle: '1px solid blue',
		childContent: [
			'Name: ',
			NameBox(user.firstName + ' ' + user.lastName)
		]
	};
}
//let user = { firstName: 'Sebastian', lastName: 'Markbage' }
//console.log(FancyUserBox(user))

/*  Composition(组合)  */
function FancyBox(children) {  //参数是数组
	return {
		borderStyle: '1px solid blue',
		children: children
	}
}
function UserBox(user) {
	return FancyBox([
		'Name: ',
		NameBox(user.firstName + ' ' + user.lastName)
	]);
}
//console.log(UserBox(user))

/*  State(状态)  */
//数据模型不可变，将函数串联，认为更新状态的函数在最顶端
function FancyNameBox(user, likes, onClick) {
	return FancyBox([
		'Name': NameBox(user.firstName + ' ' + user.lastName),
		'Likes': LikeBox(likes),  //绑定状态
		LikeButton(onClick)  //绑定方法
	])
}
// Implementation Details
var likes = 0;
function addOneMoreLike() {
	likes++;
	rerender(); //状态改变，重新渲染
}
//Init
FancyNameBox(
	{ firstName: 'Sebastian', lastName: 'Markbage'},
	likes,
	addOneMoreLike
);


/*  Memoization(记忆)  */
//将计算过程的输入和结果缓存起来  运用闭包
function memoize(fn) {
	var cacheArg;  //缓存参数
	var cacheResult;  //缓存结果
	return function(arg) {
		//参数一样直接返回结果
		if (cacheArg === arg) {
			return cacheResult;
		}
		cacheArg = arg;
		cacheResult = fn(arg);
		return cacheResult;
	}
}

var MemoizedNameBox = memoize(NameBox); //执行memoize,传递NameBox方法,返回一个匿名函数

function NameAndAgeBox(user, currentTime) {
	return FancyBox([
		'Name: ',
		MemoizedNameBox(user.firstName + ' ' + user.lastName),
		'Age in milliseconds: ',
		currentTime - user.dateOfBirth
	])
}

/*  Lists列表  */
//创造一个Map把每个元素的状态存起来
function UserList(users, likesPerUser, updateUserLikes) {
	return users.map(user => FancyNameBox(
		user,
		likesPerUser.get(user.id), //获取Map结构键对应的值
		() => updateUserLikes(user.id, likesPerUser.get(user.id) + 1) //更新状态
	));
}

var likesPerUser = new Map(); //Map结构
function updateUserLikes(id, likeCount) {
	likesPerUser.set(id, likeCount); //设置Map结构键值对
	rerender(); //状态改变，重新渲染
}
UserList(data.users, likesPerUser, updateUserLikes);

/*  Continuations连续性  */
/*
	柯里化方法(bind in JavaScript)  把状态从外部传入核心函数时不会遇到重复代码
*/
function FancyUserList(user) {

	return FancyBox(
		UserList.bind(null, users) //创建一个新函数，传入参数
	)
}

//box {borderStyle: '1px solid blue',children: children}
//此时的children是带有 参数users的UserList方法
const box = FancyUserList(data.users);
const resolvedChildren = box.children(likesPerUser,updateUserLikes);
//将children进行覆盖
const resolvedBox = {
	...box,
	children: resolvedChildren
}

/*  State Map(状态映射)  */
//运用组合的模式，提取和传递状态的逻辑，移动到一个底层的函数中去
function FancyBoxWithState(
	children,
	stateMap,
	updateState
) {
	//continuation继续传入剩下的两个参数。数组传给FancyBox函数
	return FancyBox(
		children.map(child => child.continuation(
			stateMap.get(child.key),
			updateState  
		))
	);
}

function UserList(users) {
	/*  
		使用'箭头函数'返回对象
		http://bbs.reactnative.cn/topic/15/react-react-native-%E7%9A%84es5-es6%E5%86%99%E6%B3%95%E5%AF%B9%E7%85%A7%E8%A1%A8/2
		中的‘把方法作为回调提供’
	 */
	return users.map(user => {
		continuation: FancyNameBox.bind(null, user), //绑定保存状态的方法
		key: user.id
	})
}

function FancyUserList(users) {
	//返回创建的新函数,参入UserList(users)返回的参数
	return FancyBoxWithState.bind(null,
		UserList(users)
	)
}

//①运行FancyUserList方法,传入data.users
const continuation = FancyUserList(data.users);
//将两个方法传入
continuation(likesPerUser, updateUserLikes);

/*  Memoization Map  */
//可以采取同样的技术去缓存组合函数

function memoize(fn) {
	return function(arg, memoizationCache) {
		//参数一样，返回原来的值
		if (memoizationCache.arg === arg) {
			return memoizationCache.result;
		}
	
		const result = fn(arg);
		memoizationCache.arg = arg;
		memoizationCache.result = result;
		return result;
	};
}

function FancyBoxWithState(
	children,
	stateMap,
	updateState,
	memoizationCache
) {
	return FancyBox(
		children.map(child => child.continuation(
			stateMap.get(child.key),
			updateState,
			memoizationCache.get(child.key)
		))
	);
}

const MemoizedFancyNameBox = memoize(FancyNameBox);
//MemoizedFancyNameBox(参数1, 参数2, 参数3, 参数4)

/*  Algebraic Effects  */