
export const data = {
	"data": {
		"accountBalance": 666,
		"missions": [
			{
				"type": "showup",
				"title": "签到",
				"description": "连续签到7天获得更高积分",
				"completed": false,
				"criteriaSatisfied": true,
				"reward": 40,
				"payload": {
					"level": 5,
					"rewards": [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110]
				}
			},
			{
				"type": "articleRead",
				"title": "阅读文章",
				"description": "每篇文章需要阅读5秒以上",
				"completed": false,
				"criteriaSatisfied": false,
				"reward": 30,
				"payload": {
					"required": 3,
					"current": 1
				}
			},
			{
				"type": "articleShared",
				"title": "分享文章",
				"description": "通过将文章或海报分享给好友、群聊或朋友圈可获得积分",
				"completed": false,
				"criteriaSatisfied": true,
				"reward": 20,
				"payload": {
					"required": 2,
					"current": 2
				}
			},
			{
				"type": "shareBeenRead",
				"title": "分享文章被好友阅读",
				"description": "每篇文章需要阅读5秒以上",
				"completed": true,
				"criteriaSatisfied": true,
				"reward": 100,
				"payload": {
					"cap": 200,
					"current": 0
				}
			}
		]
	}
}
