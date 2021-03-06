define(function (require) {
    var Backbone = require('backbone');
    var Handlebars = require('handlebars');
    var $ = require('jquery');
    var _ = require('underscore');

    var Users = require('js/collections/Users');
    var User = require('js/models/User');
    var UserRowView = require('js/views/users/UserRowView');
    var ErrorHandler = require('js/views/ErrorHandler');

    var userTable = require('text!js/templates/users/userTable.hbs');

    return Backbone.View.extend(_.extend({
        events: {
            'click #btn-user-create': '_create',
            'click #btn-user-clear': '_resetModel'
        },
        bindings: {
            '#username': 'username',
            '#password': 'password',
            '#email': 'email',
            '#firstName': 'firstName',
            '#lastName': 'lastName',
            'form.form-horizontal [name=roles]': {
                observe: 'roles',
                onGet: function (value) {
                    return _.map(value, String);
                },
                onSet: function (value) {
                    return _.map(value, Number);
                }
            },
            '#enabled': 'enabled',
            '#locked': 'locked'
        },

        template: Handlebars.compile(userTable),

        initialize: function () {
            this.listenTo(this.collection, 'sync', this.renderTable);
        },
        render: function () {
            this.$el.html(this.template());
            this._resetModel();
            return this;
        },
        renderTable: function () {
            var $tbody = this.$('tbody').empty();
            this.collection.each(function (user) {
                $tbody.append(new UserRowView({
                    model: user
                }).render().el)
            });
            return this;
        },

        _create: function () {
            if (!this.model.isValid(true)) {
                return false;
            }
            this.collection.create(this.model, {
                validate: false, // because password in response body is null
                success: _.bind(this._resetModel, this),
                error: _.bind(function (model, response) {
                    this.showErrors(response.responseJSON);
                }, this)
            });
        },

        _resetModel: function () {
            if (this.model) {
                this.unstickit(this.model);
                Backbone.Validation.unbind(this);
            }
            this.model = new User();
            Backbone.Validation.bind(this);
            this.stickit();
        }
    }, ErrorHandler));
});