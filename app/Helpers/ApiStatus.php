<?php


namespace App\Helpers;

abstract class ApiStatus
{
    // todo: 临时的放这里，后续还是要放到mainaer/helpers里面
    const ERR_INVALID_DATA              = 444;// 无效的数据（临时错误信息，待整改）
    const ERR_DENY_SMS = 432; // 禁止发送SMS（可能是发送得太多了，或者是黑名单里的）
    const SUCCESS                                     = 100; // 成功

    // 通用错误
    const ERR_UNKNOWN                                 = 102; // 失败
    const ERR_MISSING_ARGUMENT                        = 103; // 缺少参数
    const ERR_UNAUTHORIZED                            = 104; // 权限不足，请登录后再试
    const ERR_INSUFFICIENT_AUTHORITY                  = 105; // 权限不足，您不能进行此项操作
    const ERR_UN_LOGIN                                = 106; // 未登录
    const ERR_LOGIN_ERROR                             = 107; // 用户名或密码错误
    const ERR_LOGIN_TRY_ERROR                         = 108; // 输错密码次数太多，请一小时后再试
    const OLD_PASSWORD_WRONG                          = 109; // 原密码错误
    const ERR_INVALID_TICKET                          = 204; // 票据无效
    const ERR_TIMEOUT                                 = 208; // 超时
    const ERR_INVALID_CAPTCHA                         = 203; // 验证码错误或已过期

    // 用户输入有问题导致的错误
    const ERR_INVALID_ARGUMENT                        = 401; // 输入参数非法
    const ERR_DUPLICATED_OPERATION                    = 402; // 请不要重复操作
    const ERR_INVALID_OPERATION                       = 403; // 非法操作
    const ERR_NOT_FOUND                               = 404; // 未找到
    const ERR_DUPLICATED_LIKE                         = 405; // 请不要重复点赞，亲
    const ERR_COMMENT_TOO_SHORT                       = 406; // 评论太短啦，请多说点吧
    const ERR_COMMENT_TOO_LONG                        = 407; // 评论太长啦，请精简点吧
    const ERR_REPEAT_REQUEST_CAPTCHA                  = 408; // 请不要反复获取验证码
    const ERR_ORDER_WITHOUT_PHONE                     = 409; // 您还未验证手机号码，请验证后再继续下单
    const ERR_ORDER_CREATE_WHEN_HAS_UNCOMPLETED       = 410; // 还有尚未完成的预约单，不能创建新的预约单
    const ERR_FINISHED_ORDER_CANNOT_CANCEL            = 411; // 已经完成了的订单不能取消
    const ERR_TICKET_GOODS_OFFLINE_OR_NOT_EXISTS      = 412; // 该优惠券已经下架或不存在，请重新选择优惠券
    const ERR_CANNOT_REFUND_WHEN_UNPAID               = 413; // 您还没有支付，不能退款
    const ERR_CANNOT_REFUND_AGAIN                     = 414; // 您已经退款过了，不能重复退款
    const ERR_CANNOT_APPLY_REFUND_TWICE               = 415; // 您的退款申请正在处理中，请不要重复提交
    const ERR_DUPLICATED_TICKET_ORDER                 = 416; // 您已经购买过此返利券，请不要重复购买
    const ERR_NAME_OR_PHONE_NOT_MATCH_CREATE_INFO     = 417; // 您所填写的姓名和电话号码与购买时的不一致，请查正后再重新输入
    const ERR_WITHDRAW_IS_NOT_ALLOWED                 = 418; // 此返利券暂时还不能提现
    const ERR_DUPLICATED_WITHDRAW_APPLY               = 419; // 您已经申请了提现操作，请不要重复提交
    const ERR_DUPLICATED_WITHDRAW                     = 420; // 您已经提现过了，请不要重复提现
    const ERR_INVALID_OPERATION_ON_CANCELED_ORDER     = 421; // 此返利券已经取消了，操作失败！
    const ERR_INVALID_OPERATION_ON_DELETED_ORDER      = 422; // 此返利券已经删除了，操作失败！
    const ERR_CANNOT_REFUND_AFTER_WITHDRAW            = 423; // 您已经申请提现了，不能再退款了！
    const ERR_CANNOT_WITHDRAW_WHEN_UNPAID_OR_REFUNDED = 424; // 您已经退款了，不能再提现了！
    const ERR_CANNOT_WITHDRAW_AN_EXPIRED_TICKET_ORDER = 425; // 此返利券已经过期，不能再提现了！
    const ERR_CANNOT_ACTIVE_UNPAID_TICKET_ORDER       = 426; // 不能激活未支付的返利券
    const ERR_CANNOT_ACTIVE_REFUNED_TICKET_ORDER      = 427; // 不能激活已经退款的返利券
    const ERR_STOCK_RUN_OUT                           = 428; // 不好意思，库存不足了！
    const ERR_PUSH_FAILED                             = 429; // 推送失败了！请稍候重试或联系管理员！
    const ERR_PUSH_TIMEOUT                            = 430; // 推送超时了！请稍后重试或联系管理员！
    const ERR_CANNOT_WITHDRAW_BEFORE_SHARED           = 431; // 请先分享再提现

    // 服务器内部错误
    const ERR_INTERNAL_EXCEPTION                      = 500; // 内部异常
    const ERR_DB_FAIL                                 = 501; // 数据库挂了
    const ERR_INVALID_RESPONSE                        = 511; // 无效的应答
    const ERR_EMPTY_RESPONSE                          = 512; // 应答为空
    const ERR_INTERFACE_FAILED                        = 513; // 接口调用失败
    const ERR_INVALID_PAY_STATUS                      = 514; // 支付状态无效
    const ERR_INVALID_STATUS                          = 515; // 状态无效
    const ERR_INVALID_USER                            = 516; // 无效的用户
    const ERR_INVALID_TICKET_GOODS                    = 517; // 无效的返利券
    const ERR_INVALID_WITHDRAW_STATUS                 = 518; // 提现状态无效

    const ERR_COMMENT_FAILED                          = 521; // 评论失败
    const ERR_COMMENT_REPEAT                          = 522; // 也许您已经评价过了，请勿重复评价

    public static $Messages = [
        self::SUCCESS                                     => '成功',
        self::ERR_UNKNOWN                                 => '失败',
        self::ERR_MISSING_ARGUMENT                        => '缺少参数',
        self::ERR_UNAUTHORIZED                            => '权限不足，请登录后再试',
        self::ERR_INSUFFICIENT_AUTHORITY                  => '权限不足，您不能进行此项操作',
        self::ERR_INVALID_TICKET                          => '票据无效',
        self::ERR_TIMEOUT                                 => '超时',
        self::ERR_INVALID_CAPTCHA                         => '验证码错误或已过期',
        self::ERR_INVALID_ARGUMENT                        => '输入参数非法',
        self::ERR_DUPLICATED_OPERATION                    => '请不要重复操作',
        self::ERR_INVALID_OPERATION                       => '非法操作',
        self::ERR_NOT_FOUND                               => '未找到',
        self::ERR_DUPLICATED_LIKE                         => '请不要重复点赞，亲',
        self::ERR_COMMENT_TOO_SHORT                       => '评论太短啦，请多说点吧',
        self::ERR_COMMENT_TOO_LONG                        => '评论太长啦，请精简点吧',
        self::ERR_REPEAT_REQUEST_CAPTCHA                  => '请不要反复获取验证码',
        self::ERR_ORDER_WITHOUT_PHONE                     => '您还未验证手机号码，请验证后再继续下单',
        self::ERR_ORDER_CREATE_WHEN_HAS_UNCOMPLETED       => '还有尚未完成的预约单，不能创建新的预约单',
        self::ERR_FINISHED_ORDER_CANNOT_CANCEL            => '已经完成了的订单不能取消',
        self::ERR_TICKET_GOODS_OFFLINE_OR_NOT_EXISTS      => '该优惠券已经下架或不存在，请重新选择优惠券',
        self::ERR_CANNOT_REFUND_WHEN_UNPAID               => '您还没有支付，不能退款',
        self::ERR_CANNOT_REFUND_AGAIN                     => '您已经退款过了，不能重复退款',
        self::ERR_CANNOT_APPLY_REFUND_TWICE               => '您的退款申请正在处理中，请不要重复提交',
        self::ERR_DUPLICATED_TICKET_ORDER                 => '您已经购买过此返利券，请不要重复购买',
        self::ERR_NAME_OR_PHONE_NOT_MATCH_CREATE_INFO     => '您所填写的姓名和电话号码与购买时的不一致，请查正后再重新输入',
        self::ERR_WITHDRAW_IS_NOT_ALLOWED                 => '此返利券暂时还不能提现',
        self::ERR_DUPLICATED_WITHDRAW_APPLY               => '您已经申请了提现操作，请不要重复提交',
        self::ERR_DUPLICATED_WITHDRAW                     => '您已经提现过了，请不要重复提现',
        self::ERR_INVALID_OPERATION_ON_CANCELED_ORDER     => '此返利券已经取消了，操作失败！',
        self::ERR_INVALID_OPERATION_ON_DELETED_ORDER      => '此返利券已经删除了，操作失败！',
        self::ERR_CANNOT_REFUND_AFTER_WITHDRAW            => '您已经申请提现了，不能再退款了！',
        self::ERR_CANNOT_WITHDRAW_WHEN_UNPAID_OR_REFUNDED => '您已经退款了，不能再提现了！',
        self::ERR_CANNOT_WITHDRAW_AN_EXPIRED_TICKET_ORDER => '此返利券已经过期，不能再提现了！',
        self::ERR_CANNOT_ACTIVE_UNPAID_TICKET_ORDER       => '不能激活未支付的返利券',
        self::ERR_CANNOT_ACTIVE_REFUNED_TICKET_ORDER      => '不能激活已经退款的返利券',
        self::ERR_STOCK_RUN_OUT                           => '不好意思，库存不足了！',
        self::ERR_PUSH_FAILED                             => '推送失败了！请稍候重试或联系管理员！',
        self::ERR_PUSH_TIMEOUT                            => '推送超时了！请稍后重试或联系管理员！',
        self::ERR_CANNOT_WITHDRAW_BEFORE_SHARED           => '请先分享再提现',
        self::ERR_INTERNAL_EXCEPTION                      => '内部异常',
        self::ERR_DB_FAIL                                 => '数据库挂了',
        self::ERR_INVALID_RESPONSE                        => '无效的应答',
        self::ERR_EMPTY_RESPONSE                          => '应答为空',
        self::ERR_INTERFACE_FAILED                        => '接口调用失败',
        self::ERR_INVALID_PAY_STATUS                      => '支付状态无效',
        self::ERR_INVALID_STATUS                          => '状态无效',
        self::ERR_INVALID_USER                            => '无效的用户',
        self::ERR_INVALID_TICKET_GOODS                    => '无效的返利券',
        self::ERR_INVALID_WITHDRAW_STATUS                 => '提现状态无效',
        self::ERR_COMMENT_FAILED                          => '评论失败',
        self::ERR_COMMENT_REPEAT                          => '也许您已经评价过了，请勿重复评价',

        self::ERR_UN_LOGIN                                => '未登录',
        self::ERR_LOGIN_ERROR                             => '用户名或密码错误',
        self::ERR_LOGIN_TRY_ERROR                         => '输错密码次数太多，请一小时后再试',
        self::OLD_PASSWORD_WRONG                         => '原密码错误'
    ];

    public static function getMessage($status)
    {
        try {
            return app('message')->get($status, isset(self::$Messages[$status]) ? self::$Messages[$status] : '');
        } catch (\Exception $e) {
            return isset(self::$Messages[$status]) ? self::$Messages[$status] : '';
        } catch (\Throwable $t) {
            return isset(self::$Messages[$status]) ? self::$Messages[$status] : '';
        }
    }
}