<?php


namespace App\Exceptions;

use App\Helpers\ApiStatus;

class ApiException extends \Exception
{
    /**
     * ApiException constructor.
     *
     * @param int|string            $message or code
     * @param int|string            $code or message
     * @param \Exception|null $previous
     */
    public function __construct($message=null, $code=ApiStatus::ERR_UNKNOWN, \Exception $previous=null)
    {
        if (func_num_args() == 1 && is_numeric($message)){
            list($message, $code) = ['', $message];
        } else if (func_num_args() > 1 && is_numeric($message) && !is_numeric($code)){
            list($message, $code) = [$code, $message];
        }

        parent::__construct(!empty($message) ? $message : ApiStatus::getMessage($code), $code, $previous);
    }
}