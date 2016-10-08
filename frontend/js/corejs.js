var CoreJS = CoreJS || {};

CoreJS.namespace = function (ns_string) {
    var parts = ns_string.split('.'),
        parent = CoreJS,
        i;
    // strip redundant leading global
    if (parts[0] === 'CoreJS') {
        parts = parts.slice(1);
    }
    for (i = 0; i < parts.length; i += 1) {
        // create a property if it doesn't exist
        if (typeof parent[parts[i]] === 'undefined') {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }
    return parent;
};

CoreJS.namespace('CoreJS.view.List');

CoreJS.view.List = {
    selector: '',

    width: null,
    heightDataList: null,

    url: null,
    autoload: true,
    class: '',
    classDataList: '',
    classDataRow: '',
    classPaginator: '',
    textNoRows: '<span class="fa fa-meh-o core-js-list-no-rows"></span>',

    pagination: {
        page: 1,
        rows: 20,
        totalPages: 1
    },

    reader: {
        rootProperty: 'data',
        totalProperty: 'total'
    },

    baseParams: {},
    data: [],
    total: 0,
    response: null,

    init: function(config) {
        var me = {};
        $.extend(true, me, this, config);

        me.render();

        if (me.autoload) {
            me.load();
        }

        return me;
    },

    template: function(k, row, cmp){
        var html = '';
        $.each(row, function(kk, vv){
            html += kk + ' - ' + vv + '<br />';
        });

        return html;
    },

    load: function() {
        if (this.beforeLoad() === false) {
            return;
        }

        this.loadData();
    },

    beforeLoad: function() {
        return true;
    },

    afterLoad: function() {
        return true;
    },

    loadData: function() {
        if (!this.url || !this.url.length) {
            return;
        }

        var me = this,
            data = {};

        me.showLoading();

        $.extend(data, {
            page: me.pagination.page,
            rows: me.pagination.rows
        }, this.baseParams);

        $.ajax({
            method: 'GET',
            dataType: 'json',
            url: this.url,
            data: data
        }).done(function(response) {
            me.hideLoading();

            me.afterLoad(response);

            me.response = response;
            me.data = eval('response.' + me.reader.rootProperty);
            me.total = eval('response.' + me.reader.totalProperty);
            me.pagination.totalPages = Math.ceil(me.total / me.pagination.rows);

            me.renderData();
        });
    },

    showLoading: function() {
        this.elLoading.show();
    },

    hideLoading: function() {
        this.elLoading.hide();
    },

    render: function() {
        var me = this;
        this.container = $(this.selector);

        this.el = $('<div class="core-js-list ' + this.class + '"></div>');
        this.elLoading = $('<div class="core-js-list-loading"></div>');
        this.elData = $('<ul class="core-js-list-data ' + (this.heightDataList ? 'core-js-list-data-scroll ' : '') + this.classDataList + '" style="' + (this.heightDataList ? 'height: ' + this.heightDataList + ';' : '') + '"></ul>');

        this.elPagination = $(
            '<div class="core-js-list-pagination clearfix ' + this.classPagination + '">' +
                '<div class="btn-group pull-right">' +
                    '<button class="btn btn-white btn-sm btn-refresh"><i class="fa fa-refresh"></i></button>' +
                    '<button class="btn btn-white btn-sm btn-prev"><i class="fa fa-arrow-left"></i></button>' +
                    '<button class="btn btn-white btn-sm btn-next"><i class="fa fa-arrow-right"></i></button>' +
                '</div>' +
            '</div>'
        );

        this.el.append(this.elLoading, this.elData, this.elPagination);
        this.container.html(this.el);

        this.elPagination.find('.btn-refresh').on('click', function(e){
            e.preventDefault();
            me.load();
        });

        this.elPagination.find('.btn-prev').on('click', function(e){
            e.preventDefault();
            me.loadPreviousPage();
        });

        this.elPagination.find('.btn-next').on('click', function(e){
            e.preventDefault();
            me.loadNextPage();
        });
    },

    renderData: function() {
        var me = this,
            html = '',
            ret;

        if (typeof this.data != 'undefined' && this.data && $.isArray(this.data) && this.data.length) {
            $.each(this.data, function (k, v) {
                ret = me.template(k, v, me),
                    ret = typeof ret === 'string' ? ret : '';

                html += '<li idx="' + k + '" class="' + me.classDataRow + '">' + ret + '</li>';
            });
        } else {
            html += '<li>' + me.textNoRows + '</li>';
        }

        this.elData.html(html);

        // pagination disable
        this.elPagination.find('.btn-prev').attr('disabled', this.pagination.page == 1);
        this.elPagination.find('.btn-next').attr('disabled', this.pagination.page == this.pagination.totalPages || !this.pagination.totalPages);
    },

    loadPage: function(page) {
        var page = page || null;
        if (page && page != this.pagination.page && page >= 1 && page <= this.pagination.totalPages) {
            this.pagination.page = page;
            this.load();
        }
    },

    loadPreviousPage: function() {
        this.loadPage(Math.max(this.pagination.page - 1, 1));
    },

    loadNextPage: function() {
        this.loadPage(Math.min(this.pagination.page + 1, this.pagination.totalPages));
    }
};