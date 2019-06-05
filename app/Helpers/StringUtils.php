<?php


namespace App\Helpers;


class StringUtils
{
    public static function leftOf($haystack, $needle, $default='')
    {
        $needlePos = strpos($haystack, $needle);
        if ($needlePos === false){
            return $default;
        }

        return substr($haystack, 0, $needlePos);
    }

    public static function leftOfLast($haystack, $needle, $default='')
    {
        $needlePos = strrpos($haystack, $needle);
        if ($needlePos === false){
            return $default;
        }

        return substr($haystack, 0, $needlePos);
    }

    public static function rightOf($haystack, $needle, $default='')
    {
        $needlePos = strpos($haystack, $needle);
        if ($needlePos === false){
            return $default;
        }

        return substr($haystack, $needlePos + 1);
    }

    public static function rightOfLast($haystack, $needle, $default='')
    {
        $needlePos = strrpos($haystack, $needle);
        if ($needlePos === false){
            return $default;
        }

        return substr($haystack, $needlePos + 1);
    }

    /**
     * Determine if a given string ends with a given substring.
     *
     * @param  string  $haystack
     * @param  string|array  $needles
     * @return bool
     */
    public static function endsWith($haystack, $needles)
    {
        foreach ((array) $needles as $needle) {
            if ((string) $needle === substr($haystack, -strlen($needle))) {
                return true;
            }
        }

        return false;
    }


    /**
     * Determine if a given string starts with a given substring.
     *
     * @param  string  $haystack
     * @param  string|array  $needles
     * @return bool
     */
    public static function startsWith($haystack, $needles)
    {
        foreach ((array) $needles as $needle) {
            if ((string) $needle === substr($haystack, 0, strlen($needle))) {
                return true;
            }
        }

        return false;
    }


    /**
     * 如果非空，则在前面追加一段文本
     * @param $prepend
     * @param $main
     * @return string
     */
    public static function prependIfNotEmpty($prepend, $main){
        if (!$main) {
            return '';
        }

        return $prepend . $main;
    }


    /**
     * 如果非空，则在后面追加一段文本
     * @param $main
     * @param $append
     * @return string
     */
    public static function appendIfNotEmpty($main, $append){
        if (!$main) {
            return '';
        }

        return $main . $append;
    }


    /**
     * 如果非空，则在前面和后面各追加一段文本
     * @param $prepend
     * @param $main
     * @param $append
     * @return string
     */
    public static function wrapIfNotEmpty($prepend, $main, $append=''){
        if (!$main) {
            return '';
        }

        return $prepend . $main . $append;
    }
}