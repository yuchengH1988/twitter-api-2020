# Simple Twitter API


模擬Twitter的團體專案練習。

### Base URL

- Simple Tweet API on heroku [https://simple-twitter-api-2021.herokuapp.com/](https://simple-twitter-api-2021.herokuapp.com/)

## 環境建置( prerequisites )


- Express 4.16.4
- Node.js 10.15.0
- MySQL 8.0.23
- [socket.io](http://socket.io) 4.0.1

## 本地專案初始化( local install )

1.  下載專案並安裝套件

```jsx
git clone https://github.com/KarolChang/twitter-api-2020
npm install
```

2. 設定MySQL資料庫與種子資料，並執行專案資料庫

```jsx
npx sequelize db:migrate
npx sequelize db:seed:all
```

3. 建立.env檔

```jsx
JWT_SECRET=your_JWT_SECRET
IMGUR_CLIENT_ID=your_client_id
```

4. 執行專案

```jsx
npm run dev
```


## 共同開發人員


[Karol Chang](https://github.com/KarolChang/twitter-api-2020)

[Calvin Huang](https://github.com/yuchengH1988/twitter-api-2020)


# API

- 除了後台登入、前台登入、前台註冊這3條路由之外，其餘皆需在header的Authorization帶上Bearer +  token
- response皆包含http status code & message (說明成功狀態或是失敗原因)
- 可使用下列的使用者帳號於系統登入

```jsx
Admin
Account: root
Password: 12345678

User
Account: user1
Password: 12345678
```


## API 路由文件

### 後臺管理者登入 ( 使用者認證 )

```jsx
POST /api/admin/login/
```

**Request**

| 欄位Params | 型別 type | 說明 description |
| ---------- | --------- | ---------------- |
| account    | String    | 帳號             |
| password   | String    | 密碼             |

**Response**

Success

```jsx
{
    "status": "success",
    "message": "ok",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE5MDE1NjUyfQ.p4SoR-YSIBf_WhbacPFdKuEAKui8nRnuWd7F5g808vQ",
    "user": {
        "id": 1,
        "account": "@root",
        "email": "root@example.com",
        "name": "root",
        "role": "admin"
    }
}
```

error

```jsx
{
    "status": "error",
    "message": "password incorrect!"
}
```

### 後臺查看站內所有的使用者

```jsx
GET /api/admin/users/
```

**Response**

Success ( 以一個使用者為例 )

```jsx
[
    {
        "id": 6,
        "account": "@user5",
        "name": "user5",
        "avatar": "https://loremflickr.com/320/240/people/?lock=69",
        "cover": "https://loremflickr.com/800/300/restaurant,food/?lock=938",
        "tweetCount": 10,
        "tweetsLikedCount": 20,
        "followingsCount": 2,
        "followersCount": 0
    }
]
```
error

```jsx
{ message: 'db has no user!' }
```

### 後臺刪除一筆推文

```jsx
DELETE /api/admin/tweets/:id
```
**Response**

Success

```jsx
{
    "status": "success",
    "message": "this tweet has been deleted!"
}
```

error

```jsx
{
    "status": "error",
    "message": "this tweet doesn't exist!"
}
```

### 使用者登入 ( 使用者認證 )

```jsx
POST /api/login/
```

**Request**

| 欄位(Params) | 型別( type ) | 說明 (description) |
| ------------ | ------------ | ------------------ |
| account      | String       | 帳號               |
| password     | String       | 密碼               |

**Response**

Success

```jsx
{
    "status": "success",
    "message": "ok",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNjE5MDUyMzA2fQ.KA-DnUFacafM1EanBDtY97vyo5f0cnQlyuhnwqdg_0I",
    "user": {
        "id": 2,
        "account": "@user1",
        "email": "user1@example.com",
        "name": "user1",
        "role": "user"
    }
}
```

error

```jsx
{
    "status": "error",
    "message": "email and password are required!"
}
```

### 註冊

```jsx
POST /api/users/
```

**Request**

| 欄位(Params)  | 型別( type ) | 說明 (description) |
| ------------- | ------------ | ------------------ |
| account       | String       | 帳號               |
| name          | String       | 暱稱               |
| email         | String       | 信箱               |
| password      | String       | 密碼               |
| checkPassword | String       | 確認密碼           |

**Response**

Success

```jsx
{
    "status": "success",
    "message": "register success!"
}
```

error

```jsx
{
    "status": "error",
    "message": "password & confirmPassword must be same!"
}
```

### 查看單一使用者資訊

```jsx
GET /api/users/:id
```
**Response**

Success

```jsx
{
    "id": 3,
    "account": "@user2",
    "name": "user2",
    "avatar": "https://loremflickr.com/320/240/people/?lock=42",
    "cover": "https://loremflickr.com/800/300/restaurant,food/?lock=132",
    "introduction": "Consequatur consequatur sit numquam voluptas velit nulla iste magni veniam. Velit et culpa id velit. Reprehenderit nihil unde officia et itaque unde voluptas. Architecto corrupti et alias inventore assumenda. Consequatur libero ipsa consequuntur fugiat soluta magni."
    "tweetCount": 10,
    "followingCount": 1,
    "followerCount": 0,
    "isFollowing": false,
    "isSubscript": true
}
```

error

```jsx
{
    "message": "can not find this user!"
}
```

### 使用者編輯自己的資料

```jsx
PUT /api/users/:id
```

**Request**

| 欄位(Params)  | 型別( type ) | 說明 (description) |
| ------------- | ------------ | ------------------ |
| Authorization | String       | "Bearer"+token     |
| name          | String       | 暱稱               |
| email         | String       | 信箱               |
| account       | String       | 帳號               |
| password      | String       | 密碼               |
| checkPassword | String       | 確認密碼           |
| introduction  | String       | 簡介               |
| avatar        | String       | 大頭貼             |
| cover         | String       | 封面照             |

**Response**

Success

```jsx
{
    "status": "success",
    "message": "profile edit success!"
}
```

error

```jsx
{
    "status": "error",
    "message": "can not edit profile of other users!"
}
```

### 查看單一使用者發過的推文

```jsx
GET /api/users/:id/tweets
```
**Response**

Success ( 以一則為例 )

```jsx
[
  {
        "id": 31,
        "UserId": 5,
        "description": "Omnis et et laboriosam placeat qui aut vel velit voluptates. Sit similique aut. Beatae sed repellendus velit. Similique voluptatem cum atque deleniti necessitatibus eveniet. Hic similique suscipit a. Est autem fuga.",
        "createdAt": "2021-04-24T09:48:06.000Z",
        "fromNow": "a day ago",
        "User": {
            "id": 5,
            "name": "user4",
            "account": "user4",
            "avatar": "https://loremflickr.com/800/300/restaurant,food/?lock=769"
        },
        "replyCount": 3,
        "likeCount": 1
    },
]
```

error

```jsx
{
    "message": "can not find this user!"
}
```

### 查看單一使用者回覆過的貼文

```jsx
GET /api/users/:id/replied_tweets
```

**Response**

Success

```jsx
[
    {
        "id": 21,
        "comment": "Architecto dolores quibusdam libero et. Aperiam rerum explicabo voluptatem dolore sed. Sed dolores provident. Tenetur enim minus est ratione impedit eum corrupti nobis omnis. Et laboriosam et ipsam et et.",
        "createdAt": "2021-04-22T07:10:45.000Z",
        "FromNow": "a few seconds ago",
        "Tweet": {
            "id": 7,
            "UserId": 2,
            "description": "Assumenda rerum consequuntur qui porro officiis aut repellendus. Consequatur fugit perferendis id aliquid est aliquid molestias. Voluptatibus hic quis ipsam asperiores et sequi culpa consequatur. Expedita commodi impedit illum optio. Quo autem suscipit ut nulla ipsum.",
            "createdAt": "2021-04-22T07:10:45.000Z",
            "FromNow": "a few seconds ago",
            "User": {
                "id": 2,
                "account": "@user1",
                "name": "user1",
                "avatar": "https://loremflickr.com/320/240/people/?lock=906"
            },
            "replyCount": 3,
            "likeCount": 1
        }
    }
```

error

```jsx
{
    "message": "this user does not exist!"
}
```

### 查看單一使用者喜歡過的貼文

```jsx
GET /api/users/:id/likes
```
**Response**

Success ( 以一則tweet為例 )

```jsx
[
    {
        "id": 2,
        "UserId": 3,
        "TweetId": 14,
        "createdAt": "2021-04-22T07:10:45.000Z",
        "Tweet": {
            "id": 14,
            "UserId": 3,
            "description": "Veritatis ut harum ut rerum blanditiis. Nemo et veniam aspernatur et mollitia nesciunt aut sed ipsa. Facilis omnis aut voluptatem.",
            "createdAt": "2021-04-22T07:10:45.000Z",
            "fromNow": "16 minutes ago",
            "User": {
                "id": 3,
                "name": "user2",
                "account": "@user2",
                "avatar": "https://loremflickr.com/320/240/people/?lock=226"
            },
            "replyCount": 3,
            "likeCount": 3
        }
    }
]
```

error

```jsx
{
    "message": "this user has no like for any tweet!"
}
```

### 查看單一使用者的跟隨者

```jsx
GET /api/users/:id/followers
```
**Response**

Success ( 以一位跟隨者為例 )

```jsx
[
    {
        "followerId": 4,
        "account": "@user3",
        "name": "user3",
        "avatar": "https://loremflickr.com/320/240/people/?lock=648",
        "introduction": "Et laudantium itaque accusantium voluptatum nesciunt atque id voluptas. Explicabo deserunt consequatur quia.",
        "followshipCreatedAt": "2021-04-21T03:26:24.000Z",
        "isFollowing": true
    }
]
```

error

```jsx
{
    "message": "this user does not exist!"
}
```

### 查看單一使用者跟隨中的人

```jsx
GET /api/users/:id/followings
```

**Response**

Success

```jsx
[
    {
        "followingId": 2,
        "account": "@user1",
        "name": "user1",
        "avatar": "https://i.imgur.com/OFjWJfj.jpg",
        "introduction": "hello000",
        "followshipCreatedAt": "2021-04-21T03:26:24.000Z"
    }
]
```

error

```jsx
{
    "message": "this user has no following!"
}
```

### 查看建議追隨名單

```jsx
GET /api/users/tops
```

**Response**

Success ( 以1個user為例 )

```jsx
[
    {
        "id": 2,
        "name": "user1",
        "account": "user1",
        "avatar": "https://loremflickr.com/320/240/people/?lock=804",
        "isFollowing": false
    }
]
```

### 取得現在登入的user資料

```jsx
GET /api/users/currentUser
```
**Response**

Success ( 以1個user為例 )

```jsx
{
    "id": 3,
    "account": "user2",
    "name": "user2",
    "avatar": "https://loremflickr.com/320/240/people/?lock=465",
    "cover": "https://loremflickr.com/800/300/restaurant,food/?lock=911",
    "introduction": "Inventore et autem sapiente est quo sint incidunt earum nostrum. Velit voluptas voluptas aperiam enim autem autem quis ab. Aut suscipit modi voluptas laboriosam rerum occaecati eius eos.",
    "role": "user"
}
```

### 追蹤一個使用者

```jsx
POST /api/followships/
```

**Request**

| 欄位(Params) | 型別( type ) | 說明 (description) |
| ------------ | ------------ | ------------------ |
| id           | INTEGER      | 追蹤者id           |

**Response**

Success

```jsx
{
    "status": "success",
    "message": "Followship has built successfully!"
}
```

error

```jsx
{
    "status": "error",
    "message": "Can't find followerId."
}
```

### 取消追蹤使用者

```jsx
DELETE /api/followships/:userId
```

**Response**

Success

```jsx
{
    "status": "success",
    "message": "Followship has removed successfully!"
}
```

error

```jsx
{
    "status": "error",
    "message": "Can't find followerId!"
}
```

### 瀏覽多則推文

包含使用者資料、喜歡數量、回覆數量

```jsx
GET/api/tweets
```

**Response**

Success ( 以一則 tweet 為例)

```jsx
{
        "id": 1,
        "UserId": 2,
        "description": "Natus ut id consequatur autem. Suscipit mollitia a et. Aliquid illum qui dolor voluptatem pariatur veritatis ut odit incidunt. Eius nemo saepe quo est vel ut est. Ad aut harum.",
        "createdAt": "2021-04-20T10:27:23.000Z",
        "updatedAt": "2021-04-20T10:27:23.000Z",
        "likedCount": 2,
        "repliedCount": 3,
        "user": {
            "avatar": "https://loremflickr.com/320/240/people/?lock=213",
            "name": "user1",
            "account": "@user1"
        }
    }
```

error

```jsx
{
    "status": "error",
    "message": "There is no tweets in database."
}
```

### 瀏覽一筆推文

包含使用者資料、喜歡數量、回覆內容及數量

```jsx
GET/api/tweets/:tweetId
```

**Response**

Success

```jsx
{
    "id": 45,
    "UserId": 6,
    "description": "Enim a iure quasi deleniti vel. Molestias voluptatum ut doloremque nesciunt voluptas ut sed. Ad eos iure explicabo excepturi corporis. Ea ullam dolor. Consequatur iure et omnis est assumenda sint. Unde quo amet quibusdam quaerat rerum quis omnis.",
    "createdAt": "2021-04-20T10:27:23.000Z",
    "updatedAt": "2021-04-20T10:27:23.000Z",
    "likedCount": 1,
    "repliedCount": 4,
    "user": {
        "avatar": "https://loremflickr.com/320/240/people/?lock=428",
        "name": "user5",
        "account": "@user5"
    },
    "tweetReplies": [
        {
            "id": 152,
            "tweetId": 45,
            "comment": "9999999999999999",
            "updatedAt": "2021-04-23T02:13:17.000Z",
            "User": {
                "id": 2,
                "avatar": "https://loremflickr.com/320/240/people/?lock=213",
                "name": "user1",
                "account": "@user1"
            }
        }
    ]
}
```

error

```jsx
{
    "status": "error",
    "message": "Can't find this tweet."
}
```

### 新增一筆推文

```jsx
POST/api/tweets/
```

**Request**

| 欄位(Params) | 型別( type ) | 說明 (description) |
| ------------ | ------------ | ------------------ |
| description  | String       | 140字以下          |

**Response**

Success

```jsx
{
    "status": "success",
    "message": "Tweet has built successfully!"
}
```

error

```jsx
{
    "status": "error",
    "message": "Can't find this tweet."
}
```

```jsx
{
    "status": "error",
    "message": "Description max length is 140 words"
}
```

### 瀏覽一筆推文的回覆

```jsx
GET/api/tweets/:tweetId/replies
```

**Response**

Success ( 以一筆回覆為例 )

```jsx
{
        "id": 13,
        "tweetId": 5,
        "comment": "Eius voluptatem deleniti inventore sit quis esse nulla et. Cumque ut debitis. Aspernatur vero similique ipsum nam.",
        "updatedAt": "2021-04-20T10:27:23.000Z",
        "User": {
            "id": 4,
            "avatar": "https://loremflickr.com/320/240/people/?lock=584",
            "name": "user3",
            "account": "@user3"
        }
    }
```

error

```jsx
{
    "status": "error",
    "message": "Can't find this tweet."
}
```

### 新增一則回覆

```jsx
POST/api/tweets/:tweetId/replies
```

**Request**

| 欄位(Params) | 型別( type ) | 說明 (description) |
| ------------ | ------------ | ------------------ |
| comment      | String       | 140字以下          |

**Response**

Success

```jsx
{
    "status": "success",
    "message": "Reply has built successfully!"
}
```

error

```jsx
{
    "status": "error",
    "message": "It must have comment to tweet."
}
```

```jsx
{
    "status": "error",
    "message": "Comment max length is 140 words"
}
```

### 喜歡一則貼文

```jsx
POST/api/tweets/:tweetId/like
```

**Response**

Success

```jsx
{
    "status": "success",
    "message": "Like has built successfully!"
}
```

error

```jsx
{
    "status": "error",
    "message": "Failed to build a like."
}
```

### 收回對一則貼文的喜歡

```jsx
POST/api/tweets/:tweetId/unlike
```

**Response**

Success

```jsx
{
    "status": "success",
    "message": "Like has removed successfully!"
}
```

error

```jsx
{
    "status": "error",
    "message": "Failed to remove a like."
}
```

### 瀏覽所有通知

```jsx
GET /api/notifies
```

**Response**

Success ( 以一則為例 )

```jsx
"notifies": [
        {
            "id": 10,
            "readStatus": 1,
            "objectId": 88,
            "objectType": "tweets",
            "objectText": "12345678901234567890",
            "createdAt": "2021-05-02T04:06:31.000Z",
            "Sender": {
                "id": 5,
                "account": "user4",
                "name": "user4",
                "avatar": "https://loremflickr.com/320/240/people/?lock=661"
            }
        }
]
```

error

```jsx
{
    "status": "error",
    "message": "There is some error with subscriberId or authorId.."
}
```