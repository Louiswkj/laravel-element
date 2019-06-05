<?php


namespace App\Helpers;

use App\Exceptions\ApiException;
use App\Http\Response\ApiResponse;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Helpers\ApiStatus;
use Symfony\Component\VarDumper\Cloner\VarCloner;
use Symfony\Component\VarDumper\Dumper\CliDumper;
use Symfony\Component\VarDumper\VarDumper;

abstract class Utils
{

    /**
     * 转换数组为二进制累加所得
     * 传的如果是关联数组就按位置 如果不是关联数组 就从0开始计位
     * 如 [0,1,0,1] == 0*2^0 + 1*2^1 + 0*2^2 + 1*2^3 == 10
     * 如 [2=>1,3=>0,4=>1] == 1*2^(2-1) + 0*2^(3-1) + 1*2^(4-1) == 10
     * @param $arr
     * @return int|number
     */
    public static function ArrayToBinaryNumber($arr)
    {
        $sum = 0;
        $posOffset = static::isAssocArray($arr) ? 1 : 0; //判断是否是关联数组 是关联就偏移1 不是关联(纯数组)就不偏移
        foreach ($arr as $key => $item) {
            $sum += $item ? pow(2, $key - $posOffset) : 0;
        }
        return $sum;
    }

    /**
     * 判断数组是否是关联数组
     * 如[1,0,0,1] 这不是关联数组 这个key是从0依次加1的数组 纯数组
     * 如 [1=>1,3=>3] 这是关联数组
     *
     * @param array
     * @return boolean
     */
    public static function isAssocArray(array $var)
    {
        return array_diff_assoc(array_keys($var), range(0, sizeof($var))) ? TRUE : FALSE;
    }

    /**
     * 以安全的URL的方式进行base64编码
     *
     * @param string $data
     * @return string
     */
    public static function urlSafeBase64Encode($data)
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    /**
     * 以安全的URL的方式进行base64解码
     *
     * @param string $data
     * @return string
     */
    public static function urlSafeBase64Decode($data)
    {
        $data = str_replace(['-', '_'], ['+', '/'], $data);
        $padding = strlen($data) % 4;
        if ($padding > 0) {
            $data .= substr('====', $padding);
        }

        return base64_decode($data);
    }

    /**
     * Base64 + JSON进行编码，而且是URL安全的方式
     *
     * @param mixed $data
     * @return string
     */
    public static function urlSafeBase64JsonEncode($data)
    {
        return static::urlSafeBase64Encode(json_encode($data));
    }

    /**
     * Base64 + JSON进行解码，而且是URL安全的方式
     *
     * @param string $data
     * @param bool $asObject
     * @return array|string|bool|number
     */
    public static function urlSafeBase64JsonDecode($data, $asObject = false)
    {
        return json_decode(static::urlSafeBase64Decode($data), !$asObject);
    }

    public static function typeOf($something)
    {
        if (is_object($something)) {
            return 'object(' . get_class($something) . ')';
        } else {
            return gettype($something);
        }
    }

    /**
     * @param int $depth 从1开始，第几层调用栈
     * @return mixed
     */
    public static function getCaller($depth = 1)
    {
        $trace = debug_backtrace(DEBUG_BACKTRACE_PROVIDE_OBJECT | DEBUG_BACKTRACE_IGNORE_ARGS, $depth + 1);
        return end($trace);
    }

    /**
     * @param int $depth 从1开始，第几层调用栈
     * @return \ReflectionFunction|\ReflectionMethod
     */
    public static function getCallerReflectionObject($depth = 1)
    {
        $caller = Utils::getCaller($depth + 1);
        if (empty($caller['class'])) {
            return new \ReflectionFunction($caller['function']);
        } else {
            return new \ReflectionMethod($caller['class'], $caller['function']);
        }
    }

    /**
     * @param int $depth 从1开始，第几层调用栈
     * @return mixed
     */
    public static function getCallerControllerName($depth = 1)
    {
        $caller = Utils::getCaller($depth + 1);
        return preg_replace('/^.*\\\\|Controller$/', '', $caller['class']);
    }

    /**
     * @param int $depth 从1开始，第几层调用栈/view的渲染栈
     * @param int $scanDepthLimit 最多扫描深度
     * @return bool|string
     */
    public static function getCallerViewFileContent($depth = 1, $scanDepthLimit = 20)
    {
        $trace = debug_backtrace(DEBUG_BACKTRACE_PROVIDE_OBJECT | DEBUG_BACKTRACE_IGNORE_ARGS, $scanDepthLimit);
        $viewObjects = [];
        foreach ($trace as $traceItem) {
            if (isset($traceItem['object']) && $traceItem['object'] instanceof \Illuminate\View\View && !in_array($traceItem['object'], $viewObjects)) {
                $viewObjects[] = $traceItem['object'];
            }
        }

        if (empty($viewObjects)) {
            return false;
        }

        $topView = data_get($viewObjects, $depth - 1);
        if (empty($topView)) {
            return false;
        }

        $topViewFile = $topView->getPath();
        return file_get_contents($topViewFile);
    }

    /**
     * @param $dateTime
     * @return Carbon
     */
    public static function parseDateTime($dateTime)
    {
        if (empty($dateTime)) {
            return null;
        } else if (is_int($dateTime) || is_numeric($dateTime)) {
            return Carbon::createFromTimestamp($dateTime);
        } else if ($dateTime instanceof Carbon) {
            return $dateTime;
        } else if ($dateTime instanceof \DateTime) {
            return Carbon::instance($dateTime);
        } else {
            $timestamp = strtotime($dateTime);
            if ($timestamp === false) {
                return null;
            }

            return Carbon::createFromTimestamp($timestamp);
        }
    }

    /**
     * 将日期时间字符串或对象转换为时间戳
     * @param $dateTime
     * @return int
     */
    public static function parseTimestamp($dateTime)
    {
        $dateTime = static::parseDateTime($dateTime);
        return $dateTime ? $dateTime->getTimestamp() : 0;
    }

    /**
     * @param mixed $dateTime
     * @param string|null $format
     * @return string
     */
    public static function formatDateTime($dateTime, $format = null)
    {
        $dateTime = static::parseDateTime($dateTime);
        if (!$dateTime) {
            return '';
        }

        return $format ? $dateTime->format($format) : $dateTime->toDateTimeString();
    }

    /**
     * 获取周几对应的日期时间对象
     * @param  int $dayOfWeek 周几（1：周一，7：周日）
     * @param \DateTime|string|null $time 基于什么时间
     * @return Carbon
     */
    public static function getDateByDayOfWeek($dayOfWeek, $time = null)
    {
        if ($dayOfWeek <= 0 || $dayOfWeek > 7) {
            throw new \InvalidArgumentException("day of week must be 1 to 7, but got: " . $dayOfWeek);
        }

        $time = self::parseDateTime($time ?: Carbon::now());
        $time = $time->copy();
        return $time->addDays($dayOfWeek - ($time->dayOfWeek ?: 7));
    }

    /**
     * 老版本TP里面的URL
     * @param string $controllerAction
     * @param array $params
     * @return string
     */
    public static function tpWwwUrl($controllerAction, $params = [])
    {
        if (empty($params)) {
            $paramsString = '';
        } else {
            $paramsString = '/' . implode('/', collect($params)->map(function ($val, $key) {
                    return rawurlencode($key) . '/' . rawurlencode($val);
                })->toArray());
        }

        return '/index.php/' . $controllerAction . $paramsString . '.html';
    }

    /**
     * 执行一个shell命令
     *
     * @param $cmd     string 要执行的命令
     * @param $output  array 返回输出的内容的行的数组
     * @return int 返回命令的返回值
     *
     */
    public static function shellExec($cmd, &$output = null)
    {
        echo "> " . $cmd . "\n";

        $output = [];

        if (function_exists('popen')) {
            $handle = popen($cmd, 'r');

            while (!feof($handle)) {
                $line = fgets($handle);
                if ($line !== false) {
                    $output[] = rtrim($line, "\n");
                    echo $line;
                }
            }

            $ret = pclose($handle);
        } elseif (function_exists('exec')) {
            exec($cmd, $output, $ret);

            if (!empty($output)) {
                foreach ($output as $line) {
                    echo $line;
                    echo "\n";
                }
            }

        } else {
            throw new \LogicException("`exec` and `popen` function not exists!");
        }

        if (!empty($output) && trim(last($output)) && !preg_match('/\n$/', last($output))) {
            echo "\n";
        }

        echo " ==> " . $ret . "\n";

        return $ret;
    }

    /**
     * 安静地运行一个命令 -- 不输出任何东东
     * @param string $cmd
     * @param mixed $output
     * @return int
     */
    public static function shellExecSilently($cmd, &$output = null)
    {
        ob_start();

        $ret = static::shellExec($cmd, $output);

        ob_end_clean();

        return $ret;
    }

    /**
     * 高亮价格
     * @param string $price
     * @param string $htmlTag
     * @return mixed|string
     */
    public static function highlightPrice($price = '', $htmlTag = 'b')
    {
        if (empty($price)) {
            return $price;
        }

        return preg_replace('/-?(￥)?-?\d+(\.\d+)?/', '<' . $htmlTag . '>$0</' . $htmlTag . '>', htmlspecialchars($price));
    }

    /**
     * 注入一个或多个js变量
     * @param string|array $name
     * @param mixed $value
     * @return string HTML code
     */
    public static function injectJsVar($name, $value = null)
    {
        $values = is_array($name) ? $name : [$name => $value];
        $scripts = [
            '<script type="text/javascript">',
        ];

        foreach ($values as $key => $val) {
            $scripts[] = "var {$key} = " . json_encode($val, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }

        $scripts[] = '</script>';
        return implode("\n", $scripts);
    }

    public static function hiddenPhone($phone)
    {
        return substr_replace($phone, '****', 3, 4);
    }

    /**
     * 判断字符串是否以xxx开始       -- 比Str::startWith的性能要高一点点
     * @param string $haystack
     * @param array|string $needle
     * @param bool $isCaseInsensitive
     * @return bool|int
     */
    public static function strStartWith($haystack, $needle, $isCaseInsensitive = false)
    {
        $haystackLen = strlen($haystack);

        $needleArr = (array)$needle;
        if (!$isCaseInsensitive) {
            foreach ($needleArr as $needle) {
                $needleLen = strlen($needle);
                if ($needleLen === 0 && $haystackLen === 0) {
                    return true;
                }

                if ($needleLen <= $haystackLen && strncmp($haystack, $needle, $needleLen) === 0) {
                    return true;
                }
            }
        } else {
            foreach ($needleArr as $needle) {
                $needleLen = strlen($needle);
                if ($needleLen === 0 && $haystackLen === 0) {
                    return true;
                }

                if ($needleLen <= $haystackLen && strncasecmp($haystack, $needle, $needleLen) === 0) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 克隆一个对象
     * @note 坑PHP不支持把clone语句的返回值直接使用，而定义变量取名字好麻烦的说。故封装下，以便链式调用。
     * @param mixed $obj
     * @return mixed
     */
    public static function cloneObject($obj)
    {
        return clone $obj;
    }

    /**
     * 将竖线分隔的标签列表转换为数组形式
     * @param string $taglist
     * @param string $divider
     * @return array
     */
    public static function getTagsAsArray($taglist, $divider = '|')
    {
        return array_values(array_unique(array_filter(array_map('trim', explode($divider, $taglist)))));
    }

    public static function convertToKvList($map, $keyName = 'key', $valueName = 'value')
    {
        $result = [];

        foreach ($map as $key => $value) {
            $result[] = [
                $keyName => strval($key),
                $valueName => $value,
            ];
        }

        return $result;
    }

    /**
     * 将一段html中的图片都转换为懒加载形式的
     * @param $html
     * @return mixed
     */
    public static function lazifyImgInHtml($html)
    {
        return preg_replace('/<img\s+src="/', '<img class="lazy" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABAQMAAADO7O3JAAAAA1BMVEX///+nxBvIAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==" data-original="', $html);
    }

    /**
     * 计算折扣
     * @param $originalPrice float 原价
     * @param $finalPrice float 最终价
     * @param $unit string 单位 默认为空
     * @return  string
     */
    public static function calcDiscount($originalPrice, $finalPrice, $unit = '')
    {
        if (empty($originalPrice)) {
            return '';
        }

        $discount = floor(round($finalPrice) / round($originalPrice) * 100) / 10.0;
        if ($discount >= 10) {
            return '';
        }

        return $discount . $unit;
    }


    /**
     * 一个简易版本的构建URL的工具, 仿http_build_url
     * @param string|array $url
     * @param array $parts
     * @return string
     */
    public static function buildUrl($url, $parts = [])
    {
        if (empty($url)) {
            $urlParts = [];
        } elseif (is_string($url)) {
            $urlParts = parse_url($url);
        } elseif (is_array($url)) {
            $urlParts = $url;
        } else {
            throw new \InvalidArgumentException("Invalid type of URL! An array or string is needed, but got " . gettype($url));
        }

        $urlParts = array_merge($urlParts, $parts);

        $finalUrl = [];

        if (isset($urlParts['scheme'])) {
            $finalUrl[] = $urlParts['scheme'];
            $finalUrl[] = '://';
        }

        if (isset($urlParts['host'])) {
            if (empty($finalUrl)) {
                $finalUrl[] = '//';
            }

            if (isset($urlParts['user'])) {
                $finalUrl[] = $urlParts['user'];

                if (isset($urlParts['password'])) {
                    $finalUrl[] = ':';
                    $finalUrl[] = $urlParts['password'];
                }

                $finalUrl[] = '@';
            }

            $finalUrl[] = $urlParts['host'];

            if (isset($urlParts['port'])) {
                $finalUrl[] = ':';
                $finalUrl[] = $urlParts['port'];
            }

        }

        if (isset($urlParts['path'])) {
            $finalUrl[] = $urlParts['path'];
        }

        if (isset($urlParts['mergeQuery'])) {
            $queryParams = $urlParts['query'];
            if (!is_array($queryParams)) {
                parse_str($urlParts['query'], $queryParams);
            }

            $urlParts['query'] = array_merge((array)$queryParams, $urlParts['mergeQuery']);
        }

        if (isset($urlParts['query'])) {
            $finalUrl[] = '?';
            $finalUrl[] = is_array($urlParts['query']) ? http_build_query($urlParts['query']) : $urlParts['query'];
        }

        if (isset($urlParts['appendQuery'])) {
            if (isset($urlParts['query'])) {
                $finalUrl[] = '&';
            } else {
                $finalUrl[] = '?';
            }

            $finalUrl[] = is_array($urlParts['appendQuery']) ? http_build_query($urlParts['appendQuery']) : $urlParts['appendQuery'];
        }

        if (isset($urlParts['fragment'])) {
            $finalUrl[] = '#';
            $finalUrl[] = $urlParts['fragment'];
        }

        return implode($finalUrl);
    }


    /**
     * 格式化deadline
     *
     * @param $deadline int|string|\DateTime - 截止日期时间
     * @param $now      Carbon|null          - 当前时间
     * @param $min      string               - 最小单位（精确到）: seconds | minutes
     * @return array|null
     */
    public static function formatDeadline($deadline, Carbon $now = null, $min = 'seconds')
    {
        $deadline = Utils::parseDateTime($deadline);
        if (empty($deadline)) {
            return null;
        }

        $now = $now ?: Carbon::now();

        $remainSeconds = max(0, $deadline->getTimestamp() - $now->getTimestamp());

        $remain = [
            'days' => sprintf('%02d', floor($remainSeconds / (24 * 60 * 60))),
            'hours' => sprintf('%02d', floor($remainSeconds / (60 * 60) % 24)),
            'minutes' => sprintf('%02d', floor($remainSeconds / 60) % 60),
            'seconds' => sprintf('%02d', $remainSeconds % 60),
            'total_seconds' => strval($remainSeconds),
            'min' => $min,
        ];

        // 如果精确到分钟，则不足一分钟要进位
        if ($min === 'minutes') {
            $remain['minutes'] = sprintf('%02d', ceil($remainSeconds / 60) % 60);
            $remain['seconds'] = '00';
        }

        return [
            'time' => $deadline->format('Y-m-d H:i:s'),
            'is_overdue' => $remainSeconds <= 0,
            'remain' => $remain,
        ];

    }

    /**
     * 将bit或组成int拆分成数组（如 7 => 1, 2, 4）
     * @note 这与splitBitmapToIntArray不同的是，这个返回的不是bit位索引，而是每个bit的值
     *
     * @param $types   int    - 那个整数
     * @param $maxBits int    - 最多扫描多少位
     * @return array<int>
     */
    public static function splitBitTypesToArray($types, $maxBits = 32)
    {
        if (is_array($types)) {
            return $types;
        }

        if (!is_numeric($types)) {
            return [];
        }

        $types = intval($types);

        $res = [];
        for ($i = 1, $j = 1; $j <= $maxBits; $i <<= 1, $j++) {
            if ($i & $types) {
                $res[] = $i;
            }
        }

        return $res;
    }

    /**
     * 将bitmap拆分成int数组，如 7 => 1,2,3
     * @note 与splitBitTypesToArray不同的是，这里返回的是所设置了的位的索引（从1开始）
     *
     * @param $bitmap int
     * @param $maxBits int
     * @return array<int>
     */
    public static function splitBitmapToIntArray($bitmap, $maxBits = 64)
    {
        if (!is_numeric($bitmap)) {
            return [];
        }

        $bitmap = intval($bitmap);

        $res = [];
        for ($i = 1, $j = 1; $j <= $maxBits; $i <<= 1, $j++) {
            if ($i & $bitmap) {
                $res[] = $j;
            }
        }

        return $res;
    }

    /**
     * 将整数数组合并成bitmap，如 1,2,3,4 => 15
     * @param $intArr array<int>
     * @return int
     */
    public static function calcBitmapFromIntArray($intArr)
    {
        $bitmap = 0;
        foreach ($intArr as $x) {
            if ($x > 0) {
                $bitmap |= (1 << ($x - 1));
            }
        }
        return $bitmap;
    }

    /**
     * 就地修改数组元素
     * @param $array array|\Traversable
     * @param $cb callable (&$item, $key, $arr) => false|void
     * @return array|\Traversable|false
     */
    public static function modifyArrayItemsInplace(&$array, $cb)
    {
        if (!$array) {
            return $array;
        }

        foreach ($array as $key => &$item) {
            if ($cb($item, $key, $array) === false) {
                return false;
            }
        }

        return $array;
    }

    /**
     * 遍历数组，并可以就地修改数组元素
     * @param $array array|\Traversable
     * @param $cb callable (&$item, $key, $arr) => false|void
     * @return array|\Traversable|false
     */
    public static function walkArray(&$array, $cb)
    {
        foreach ($array as $key => &$item) {
            if ($cb($item, $key, $array) === false) {
                return false;
            }
        }

        return $array;
    }

    /**
     * 净化树
     * @param $tree array  [ 'children' => [ ['children' => ...] ...]
     * @param $cb callable (&$item, $key, $arr) => bool 返回真则保留，返回false则删除此节点
     * @return array
     */
    public static function sanitizeArrayTree(&$tree, $cb, $children = 'children', $maxDepth = 10)
    {
        if ($maxDepth <= 0) {
            throw new \RuntimeException("Max depth reached when walking tree!");
        }

        foreach ($tree as $key => &$item) {
            if (!empty($item[$children])) {
                static::sanitizeArrayTree($item[$children], $cb, $children, $maxDepth - 1);
            }

            if ($cb($item, $key, $tree) === false) {
                unset($tree[$key]);
                continue;
            }
        }

        $tree = array_values($tree);

        return $tree;
    }


    /**
     * 生成一棵树.
     *
     * @param array $dataList
     * @param string $idKey
     * @param string $parentIdKey
     * @param string $childrenKey
     * @param int $maxDepth
     * @param int $rootParentId
     *
     * @return array
     */
    public static function makeTree($dataList, $idKey = 'id', $parentIdKey = 'parent_id', $childrenKey = 'children', $maxDepth = 2, $rootParentId = 0)
    {
        if (!is_array($dataList)) {
            $dataList = collect($dataList)->toArray();
        }

        $groupedDataList = [];
        foreach ($dataList as $item) {
            $itemParentId = @$item[$parentIdKey] ?: $rootParentId;
            if (!isset($groupedDataList[$itemParentId])) {
                $groupedDataList[$itemParentId] = [];
            }

            $groupedDataList[$itemParentId][] = $item;
        }

        return self::_makeTreeViaGroupedDataArray($groupedDataList, $idKey, $parentIdKey, $childrenKey, $maxDepth, $rootParentId);
    }

    /**
     * 生成一棵树.
     *
     * @param array $groupedDataArray
     * @param string $idKey
     * @param string $parentIdKey
     * @param string $childrenKey
     * @param int $maxDepth
     * @param int $rootParentId
     *
     * @return array
     */
    private static function _makeTreeViaGroupedDataArray($groupedDataArray, $idKey = 'id', $parentIdKey = 'parent_id', $childrenKey = 'children', $maxDepth = 2, $rootParentId = 0)
    {
        $tree = @$groupedDataArray[$rootParentId] ?: [];

        if ($maxDepth <= 1) {
            return $tree;
        }

        // 填充子树
        $filledTree = [];
        foreach ($tree as $node) {
            $node[$childrenKey] = self::_makeTreeViaGroupedDataArray($groupedDataArray, $idKey, $parentIdKey, $childrenKey, $maxDepth - 1, @$node[$idKey]);

            $filledTree[] = $node;
        }

        return $filledTree;
    }



    /**
     * 将所有mainaer下的URL都转换成HTTP的URL
     * @param $array array  这个必须要传入一个数组
     * @return array 返回的也是一个数组
     *
     * 注意：这个接口会把所有的object转换为数组，请务必小心使用！建议仅在接口返回数据前使用
     */
    public static function convertMainaerUrlsFromHttpsToHttp($array)
    {
        return json_decode(
            preg_replace(
                '~https://((?:[a-zA-Z0-9.-]+\.)?mainaer\.com)~',
                'http://$1',
                json_encode($array, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
            ),
            true
        );
    }

    public static function dumpAsString($x, $maxStrWidth = 80)
    {
        $dumper = new CliDumper();
        $dumper->setColors(false);
        $dumper->setMaxStringWidth($maxStrWidth);

        $dumpResult = [];
        $dumper->setOutput(function ($line, $depth, $indentPad) use (&$dumpResult) {
            $dumpResult[] = str_repeat($indentPad, max(0, $depth)) . $line;
        });

        $cloner = new VarCloner();
        $cloner->setMaxItems(20);
        $cloner->setMaxString($maxStrWidth);

        $dumper->dump($cloner->cloneVar($x));

        return implode("\n", $dumpResult);

//        return json_encode([
//            '@type' => gettype($x),
//            '@class' => is_object($x) ? get_class($x) : null,
//            '@value' => implode("\n", $dumpResult),
//        ], JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT, 5);
    }

    /**
     * 规范化搜索的时候的keyword
     */
    public static function sanitizeKeyword($keyword)
    {
        return str_replace("%%", "%", "%" . str_replace(" ", "%", $keyword) . "%");
    }

    /**
     * 解析视频信息
     * @param $video
     * @return array|null
     */
    public static function parseVideoInfo($video)
    {
        if (preg_match('/^(\w+):(.*)$/', $video, $m)) {
            return [
                'type' => $m[1],
                'vid' => $m[2],
            ];
        }

        return null;
    }



    public static function isPhoneInBlackList($phone)
    {
        if (StringUtils::startsWith($phone, [
            '111', '123', '154',
            '190', '191', '192', '193', '194', '195', '196', '197'
        ])) {
            return true;
        }

        return false;
    }

    /**
     * @param $phone
     * @throws ApiException
     */
    public static function ensurePhoneIsNotInBlackList($phone)
    {
        if (self::isPhoneInBlackList($phone)) {
            throw new ApiException(ApiStatus::ERR_INVALID_ARGUMENT, "您输入的手机号码格式不正确");
        }
    }



    /**
     * 随机取数组里面的一项
     * @param $arr array
     * @return mixed
     */
    public static function randomPickOneFromArray($arr)
    {
        $arr = (array)$arr;
        shuffle($arr);
        return reset($arr);
    }

}