<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends Model
{
    protected $table = 'member';

    public $timestamps = true;

    use SoftDeletes;

    public static $instance;

    public static function getInstance()
    {
        if(!self::$instance) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function getList($condition, $pageSize = 20)
    {
        foreach ($condition as $key => $value) {
            if(in_array($key, ['page', 'pageSize']) || !$value) {
                unset($condition[$key]);
            }
        }

        $data = $this->where($condition)
            ->orderBy('created_at', 'desc')
            ->paginate($pageSize)
            ->toArray();

        return $data;
    }

    public function  detail($id)
    {
        return Member::query()
            ->leftJoin('member_account','member.id','=','member_account.member_id')
            ->leftJoin('member_force','member.id','=','member_force.member_id')
            ->where('member.id',$id)
            ->firstOrFail();
    }

}
