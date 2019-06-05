export default {
    ERR_INVALID_DATA: 444, //
    SUCCESS: 100, // 成功
    ERR_UNKNOWN: 102, // 失败
    ERR_MISSING_ARGUMENT: 103, // 缺少参数
    ERR_UNAUTHORIZED: 104, // 权限不足，请登录后再试
    ERR_INSUFFICIENT_AUTHORITY: 105, // 权限不足，您不能进行此项操作
    ERR_INVALID_TICKET: 204, // 票据无效
    ERR_TIMEOUT: 208, // 超时
    ERR_INVALID_CAPTCHA: 203, // 验证码错误或已过期
    ERR_INVALID_ARGUMENT: 401, // 输入参数非法
    ERR_DUPLICATED_OPERATION: 402, // 请不要重复操作
    ERR_INVALID_OPERATION: 403, // 非法操作
    ERR_NOT_FOUND: 404, // 未找到
    ERR_DUPLICATED_LIKE: 405, // 请不要重复点赞，亲
    ERR_COMMENT_TOO_SHORT: 406, // 评论太短啦，请多说点吧
    ERR_COMMENT_TOO_LONG: 407, // 评论太长啦，请精简点吧
    ERR_REPEAT_REQUEST_CAPTCHA: 408, // 请不要反复获取验证码
    ERR_ORDER_WITHOUT_PHONE: 409, // 您还未验证手机号码，请验证后再继续下单
    ERR_ORDER_CREATE_WHEN_HAS_UNCOMPLETED: 410, // 还有尚未完成的预约单，不能创建新的预约单
    ERR_FINISHED_ORDER_CANNOT_CANCEL: 411, // 已经完成了的订单不能取消
    ERR_TICKET_GOODS_OFFLINE_OR_NOT_EXISTS: 412, // 该优惠券已经下架或不存在，请重新选择优惠券
    ERR_CANNOT_REFUND_WHEN_UNPAID: 413, // 您还没有支付，不能退款
    ERR_CANNOT_REFUND_AGAIN: 414, // 您已经退款过了，不能重复退款
    ERR_CANNOT_APPLY_REFUND_TWICE: 415, // 您的退款申请正在处理中，请不要重复提交
    ERR_DUPLICATED_TICKET_ORDER: 416, // 您已经购买过此返利券，请不要重复购买
    ERR_NAME_OR_PHONE_NOT_MATCH_CREATE_INFO: 417, // 您所填写的姓名和电话号码与购买时的不一致，请查正后再重新输入
    ERR_WITHDRAW_IS_NOT_ALLOWED: 418, // 此返利券暂时还不能提现
    ERR_DUPLICATED_WITHDRAW_APPLY: 419, // 您已经申请了提现操作，请不要重复提交
    ERR_DUPLICATED_WITHDRAW: 420, // 您已经提现过了，请不要重复提现
    ERR_INVALID_OPERATION_ON_CANCELED_ORDER: 421, // 此返利券已经取消了，操作失败！
    ERR_INVALID_OPERATION_ON_DELETED_ORDER: 422, // 此返利券已经删除了，操作失败！
    ERR_CANNOT_REFUND_AFTER_WITHDRAW: 423, // 您已经申请提现了，不能再退款了！
    ERR_CANNOT_WITHDRAW_WHEN_UNPAID_OR_REFUNDED: 424, // 您已经退款了，不能再提现了！
    ERR_CANNOT_WITHDRAW_AN_EXPIRED_TICKET_ORDER: 425, // 此返利券已经过期，不能再提现了！
    ERR_CANNOT_ACTIVE_UNPAID_TICKET_ORDER: 426, // 不能激活未支付的返利券
    ERR_CANNOT_ACTIVE_REFUNED_TICKET_ORDER: 427, // 不能激活已经退款的返利券
    ERR_STOCK_RUN_OUT: 428, // 不好意思，库存不足了！
    ERR_PUSH_FAILED: 429, // 推送失败了！请稍候重试或联系管理员！
    ERR_PUSH_TIMEOUT: 430, // 推送超时了！请稍后重试或联系管理员！
    ERR_CANNOT_WITHDRAW_BEFORE_SHARED: 431, // 请先分享再提现
    ERR_INTERNAL_EXCEPTION: 500, // 内部异常
    ERR_DB_FAIL: 501, // 数据库挂了
    ERR_INVALID_RESPONSE: 511, // 无效的应答
    ERR_EMPTY_RESPONSE: 512, // 应答为空
    ERR_INTERFACE_FAILED: 513, // 接口调用失败
    ERR_INVALID_PAY_STATUS: 514, // 支付状态无效
    ERR_INVALID_STATUS: 515, // 状态无效
    ERR_INVALID_USER: 516, // 无效的用户
    ERR_INVALID_TICKET_GOODS: 517, // 无效的返利券
    ERR_INVALID_WITHDRAW_STATUS: 518, // 提现状态无效
    ERR_COMMENT_FAILED: 521, // 评论失败
    ERR_COMMENT_REPEAT: 522, // 也许您已经评价过了，请勿重复评价
        /// /////////////////////////////////////////////////////////
    ERR_EMPTY_DATA: 777, // 服务器虽然返回的数据，但是却没有任何data
        /// /////////////////////
    UKNOWN: 0
}
