import toArray from '@/common/to-array'
import globalDatePicker from '@/components/global-date-picker'
import GlobalCombox from '@/components/global-combox'

import './el-table-filter.less'


const KEYCODE_ENTER = 13

export default {
    computed: {
        elTableFilters(){
            const filters = {
                TEXT,
                SUBTEXT,
                SELECT,
                COMBOX,
                RANGE,
                DATE_RANGE,
                DATETIME_RANGE,
            }

            // 绑定this
            Object.keys(filters).forEach(k => {
                filters[k] = filters[k].bind(this)
            })

            return filters
        }
    },
    methods: {
        onFiltersChange(filters){
            console.warn("onFiltersChange: ", filters)
            this.params = {
                ...this.params,
                ...filters,
            }
            this.reload()
        },
        onTableSortChanged({column, prop, order}){
            this.params.sort_field = prop || 'id'
            this.params.sort_dir = (order === 'ascending' ? 'asc' : 'desc')
            this.reload()
        },
        convertToPqGridParams,
    },
    convertToPqGridParams,
}


export function TEXT(options={}){
    return (h, {column, $index}) => {
        const label = options.label || column.label
        const field = options.field || column.property
        const condition = options.condition || 'equal'

        const commitValue = (value) => {
            this.onFiltersChange({
                [field]: {
                    condition,
                    value: value,
                }
            })
        }

        return (
            <div class="el-table-th-w">
                <div class="el-table-th">{label}</div>
                <div class="el-table-tf text-filter">
                    <input type="text" class="el-table-tf-input"
                           onKeydown={ifKeyIsEnter(e => commitValue(e.target.value))}
                           onChange={e => commitValue(e.target.value)}
                           onClick={stopEventPropagation} />
                </div>
            </div>
        )
    }
}

export function SUBTEXT(options={}){
    return TEXT.call(this, {...options, condition: 'contain'})
}

/**
 * SELECT -- 选择框
 * @param {{options: Array<{label,val}|string>, label, field, valField='val', labelField='label', prependEmpty}} options 选项列表
 */
export function SELECT(options={}){
    return (h, {column, $index}) => {
        const label = options.label || column.label
        const field = options.field || column.property
        const prependEmpty = options.prependEmpty || false
        const condition = options.condition || 'equal'
        const valField = options.valField || 'val'
        const labelField = options.labelField || 'label'

        const commitValue = (value) => {
            this.onFiltersChange({
                [field]: {
                    condition,
                    value: value,
                }
            })
        }

        return (
            <div class="el-table-th-w">
                <div class="el-table-th">{label}</div>
                <div class="el-table-tf text-filter">
                    <select type="text" class="el-table-tf-input"
                           onKeydown={ifKeyIsEnter(e => commitValue(e.target.value))}
                           onChange={e => commitValue(e.target.value)}
                           onClick={stopEventPropagation} >
                        {prependEmpty ? <option></option> : null}
                        {options.options.map(opt => (
                            typeof opt === 'string' 
                                ? <option value={opt}>{opt}</option>
                                : <option value={opt[valField]}>{opt[labelField]}</option>
                        ))}
                    </select>
                </div>
            </div>
        )
    }
}

/**
 * 
 * COMBOX -- 组合框
 * @param {{options: Array<{label,val}|string>, label, field, valField='val', labelField='label'}} options 选项列表
 * @param {{*}} extraAttributes 一些额外的属性
 */
export function COMBOX(options={}, extraAttributes={}){
    const wId = ('w' + Math.random()).replace('0.', '')
    console.warn('combox: ', options)

    return (h, {column, $index}) => {
        const label = options.label || column.label
        const field = options.field || column.property
        const valField = options.valField || 'val'
        const labelField = options.labelField || 'label'

        console.warn('render combox: ', options, {label, field})

        const commitValue = (v) => {
            this.onFiltersChange({
                [field]: {
                    condition: options.condition || 'equal',
                    value: v,
                }
            })
        }

        console.log("combox options: ", options.options)

        waitForElement('#' + wId, (el) => {
            const value1El = el.querySelector('.value')
            if (value1El){
                sanitizeListOptions(options.options, {valField, labelField})
                    .then(optList => {
                        if (value1El.__gcbUnbind){
                            value1El.__gcbUnbind()
                        }

                        value1El.__gcbUnbind = GlobalCombox.register(value1El, {options: optList, ...extraAttributes})
                    })
            }
        })

        return (
            <div class="el-table-th-w" id={wId} >
                <div class="el-table-th">{label}</div>
                <div class="el-table-tf text-filter">
                    <input type="text" class="el-table-tf-input value"
                           onKeydown={ifKeyIsEnter(e => commitValue(e.target.value))}
                           onChange={e => commitValue(e.target.value)}
                           onClick={stopEventPropagation} />
                </div>
            </div>
        )
    }
}

export function RANGE(options={}){
    let values = { value: '', value2: ''}
    return (h, {column, $index}) => {
        const label = options.label || column.label
        const field = options.field || column.property

        const commitValues = (v) => {
            values = {...values, ...v}
            commitRangeValues.call(this, {field, values})
        }
        return (
            <div class="el-table-th-w">
                <div class="el-table-th">{label}</div>
                <div class="el-table-tf text-filter">
                    <input type="text" class="el-table-tf-input value1"
                           onKeydown={ifKeyIsEnter(e => commitValues({value: e.target.value}))}
                           onChange={e => commitValues({value: e.target.value})}
                           onClick={stopEventPropagation} />
                </div>
                <div class="el-table-tf text-filter-di">~</div>
                <div class="el-table-tf text-filter">
                    <input type="text" class="el-table-tf-input value2"
                           onKeydown={ifKeyIsEnter(e => commitValues({value2: e.target.value}))}
                           onChange={e => commitValues({value2: e.target.value})}
                           onClick={stopEventPropagation} />
                </div>
            </div>
        )
    }
}

export function DATE_RANGE(options={}){
    return DATETIME_RANGE.call(this, {format: 'yyyy-mm-dd', ...options})
}
export function DATETIME_RANGE(options={}){
    const wId = ('w' + Math.random()).replace('0.', '')    
    const formatMap = {
        'yyyy-mm-dd hh:ii:ss': 'yyyy-MM-dd HH:mm:ss',
        'yyyy-mm-dd hh:ii': 'yyyy-MM-dd HH:mm',
        'yyyy-mm-dd': 'yyyy-MM-dd',
        'yyyy-mm': 'yyyy-MM',
    }
    
    const format = options.format || 'yyyy-mm-dd hh:ii:ss'
    const gdpFormat = formatMap[format]
    if (!gdpFormat){
        throw new Error(`Invalid date/time format: "${format}", which must be in [${Object.keys(formatMap).join(', ')}]`)
    }

    let values = { value: '', value2: ''}
    return (h, {column, $index}) => {
        const label = options.label || column.label
        const field = options.field || column.property

        const commitValues = (v) => {
            values = {...values, ...v}
            commitRangeValues.call(this, {field, values})
        }

        waitForElement('#' + wId, (el) => {
            const value1El = el.querySelector('.value1')
            if (value1El){
                if (value1El.__gdpUnbind){
                    value1El.__gdpUnbind()
                }

                value1El.__gdpUnbind = globalDatePicker.register(value1El, {format: gdpFormat, defaultTime: '00:00'})
            }
            
            const value2El = el.querySelector('.value2')
            if (value2El){
                if (value2El.__gdpUnbind){
                    value2El.__gdpUnbind()
                }

                value2El.__gdpUnbind = globalDatePicker.register(value2El, {format: gdpFormat, defaultTime: '23:59'})
            }
        })

        return (
            <div class="el-table-th-w" id={wId} >
                <div class="el-table-th">{label}</div>
                <div class="el-table-tf text-filter">
                    <input type="text" class="el-table-tf-input value1"
                           onKeydown={ifKeyIsEnter(e => commitValues({value: e.target.value}))}
                           onChange={e => commitValues({value: e.target.value})}
                           onClick={stopEventPropagation} />
                </div>
                <div class="el-table-tf text-filter-di">~</div>
                <div class="el-table-tf text-filter">
                    <input type="text" class="el-table-tf-input value2"
                           onKeydown={ifKeyIsEnter(e => commitValues({value2: e.target.value}))}
                           onChange={e => commitValues({value2: e.target.value})}
                           onClick={stopEventPropagation} />
                </div>
            </div>
        )
    }
}


/**
 * 将常规的列表params转换为pq-grid的参数
 * @param {{page,limit,sort_field,sort_dir,_,...}} params 
 *          - page: number 第几页
 *          - limit: number 每页多少条
 *          - sort_field: string 排序字段
 *          - sort_dir: "asc"|"desc" 排序方向
 *          - _: any 无用字段
 * @note 除了上面的字段之外的字段都将被视作筛选项，会被传到 pq_filter 中
 */
export function convertToPqGridParams(params){
    const filters = {...params}
    delete filters.page
    delete filters.limit
    delete filters.sort_field
    delete filters.sort_dir
    delete filters._

    const pqFilter = {
        mode: 'AND',
        data: [],
    }

    Object.keys(filters).forEach(field => {
        let v = filters[field]

        if (v && typeof v === 'object'){
            if (v.value || v.value2){
                pqFilter.data.push({
                    dataIndex: field,
                    ...v,
                })
            }
        } else {
            if (v){
                pqFilter.data.push({
                    dataIndex: field,
                    value: v,
                })
            }
        }
    })

    return {
        pq_datatype: 'JSON',
        pq_filter: JSON.stringify(pqFilter),
        pq_curpage: +params.page || 1,
        pq_rpp: +params.limit || 20,
        pq_sort: JSON.stringify([
            {
                dataIndex: params.sort_field, 
                dir: params.sort_dir === 'desc' ? 'down':'up'
            }
        ])
    }
}


function commitRangeValues({field, values}){
    if (values.value && values.value2){
        this.onFiltersChange({
            [field]: { condition: 'between', ...values }
        })
    } else if (values.value){
        this.onFiltersChange({
            [field]: { condition: 'gte', value: values.value }
        })
    } else if (values.value2){
        this.onFiltersChange({
            [field]: { condition: 'lte', value: values.value2 }
        })
    } else {
        this.onFiltersChange({
            [field]: ''
        })
    }
}

function stopEventPropagation(e){
    e.stopPropagation()
}

function waitForElement(selector, callback, checkInterval=150) {
    let timer = setInterval(function(){
        const el = document.querySelector(selector)
        if (el){
            clearInterval(timer)
            timer = 0

            callback(el)
        }
    }, checkInterval)
}

function ifKeyIsEnter(cb){
    return function (e){
        if (+e.keyCode === KEYCODE_ENTER){
            cb.call(this, e)
        }
    }
}


/**
 * 规范化选项列表
 */
async function sanitizeListOptions(optList, {valField='val', labelField='label'}={}) {
    optList = await optList

    if (!optList){
        return []
    }

    if (typeof optList === 'function') {
        return sanitizeListOptions(optList())
    }

    if (optList && (typeof optList.length === 'number')){
        return toArray(optList).map(x => {
            if (typeof x === 'string') {
                return {val: x, label: x}
            } else {
                return {val: x[valField] + '', label: x[labelField]}
            }
        })
    }

    throw NewErrorWithLog("Invalid optList!", optList)
}

