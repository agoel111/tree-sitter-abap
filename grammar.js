/*-----------------------------------------------------------------------------------------------
    |@|description grammar file for Oracle pl/sql
-----------------------------------------------------------------------------------------------*/

function reservedWord(word) {
     return reserved(caseInsensitive(word.toLowerCase()))
}

function reserved(regex) {
    return token(prec(1, new RegExp(regex)))
}

function caseInsensitive(word) {
    return word.split('')
        .map(letter => `[${letter}${letter.toUpperCase()}]`)
        .join('')
}

const ASSIGNMENT = ':='
const ASSOCIATION = '=>'
const CONCAT = '||'
const NOT_EQUAL_1 = '<>'
const NOT_EQUAL_2 = '!='
const NOT_EQUAL_3 = '~='
const NOT_EQUAL_4 = '^='
const LESS_THEN_EQUAL = '<='
const GREATER_THEN_EQUAL = '>='
const EXPONENT= '**'
const LABEL_START= '<<'
const LABEL_END= '>>'
const RANGE= '..'
const SEMICOLON = ';'
const POINT_POINT = '..'
const POINT = '.'
const DOUBLE_POINT = ':'
const COMMA = ','
const PLUS = '+'
const MINUS = '-'
const MULTIPLICATION = '*'
const DIVISON= '/'
const EQUAL = '='
const LESS_THEN = '<'
const GREATER_THEN = '>'
const PERCENT = '%'
const BRACKET_LEFT = '('
const BRACKET_RIGHT = ')'
const QUOTE_SINGLE = "'"
const QUOTE_DOUBLE = '"'
const REMOTE = '@'

module.exports = grammar({
    name: 'plsql',
    conflicts: $ => [
        [$._subquery_element],
        [$._conditional_predicate],
        [$._query_partiion_clause],
        [$._outer_join_clause],
        [$._query_table_expression_ref_element],
        [$.referenced_element_point_method_call],
    ],
    extras: $ => [
        $.comment_sl,
        $.comment_ml,
        /[\s\f\uFEFF\u2060\u200B]|\\\r?\n/,
    ],
    rules: {
        source_file: $ => repeat($._element),
        _element: $ => choice(
            $._ddl_statement,
            $.statement,
        ),
        _ddl_statement: $ => choice(
             $._alter_statement,
             $._create_statement,
             $._drop_statement,
        ),
        _drop_statement: $ => choice(
            $.drop_function,
            $.drop_procedure,
            $.drop_package,
            $.drop_type,
            $.drop_type_body,
            $.drop_trigger,
            $.drop_library,
        ),
        drop_procedure: $ => seq(
            $.kw_drop,
            $.kw_procedure,
            $.referenced_element,
            SEMICOLON,
        ),
        drop_function: $ => seq(
            $.kw_drop,
            $.kw_function,
            $.referenced_element,
            SEMICOLON,
        ),
        drop_library: $ => seq(
            $.kw_drop,
            $.kw_library,
            $.identifier,
            SEMICOLON,
        ),
        drop_trigger: $ => seq(
            $.kw_drop,
            $.kw_trigger,
            $.referenced_element,
            SEMICOLON,
        ),
        drop_type: $ => seq(
            $.kw_drop,
            $.kw_type,
            $.referenced_element,
            optional(choice($.kw_force,$.kw_validate)),
            SEMICOLON,
        ),
        drop_type_body: $ => seq(
            $.kw_drop,
            $.kw_type,
            $.kw_body,
            $.referenced_element,
            SEMICOLON,
        ),
        drop_package: $ => seq(
            $.kw_drop,
            $.kw_package,
            optional($.kw_body),
            $.referenced_element,
            SEMICOLON,
        ),
        _create_statement: $ => choice(
            // TODO
            $.create_package,
            $.create_package_body,
        ),
        create_package: $ => seq(
            $.create_obj,
            optional($._editionable_noneditionable),
            $.kw_package,
            optional($._schema),
            field("obj_name", $.identifier),
            optional($.sharing_clause),
            repeat($._package_property_element),
            $._is_as,
            repeat1($._item_list_1),
            $.end_obj_named,
            optional(DIVISON),
        ),
        create_package_body: $ => seq(
            $.create_obj,
            optional($._editionable_noneditionable),
            $.kw_package,
            $.kw_body,
            optional($._schema),
            field("obj_name", $.identifier),
            optional($.sharing_clause),
            $._is_as,
            repeat1($._declare_section_element),
            $.end_obj_named,
            SEMICOLON,
            optional(DIVISON),
        ),
        _package_property_element: $ => choice(
            $.default_collation_clause,
            $.invoker_rights_clause,
            $.accessible_by_clause,
        ),
        _alter_statement: $ => seq(
            choice(
                $.alter_trigger,
                $.alter_package,
                $.alter_function,
                $.alter_procedure,
                $.alter_library,
                $.alter_type,
            ),
        ),
        alter_package: $ => seq(
            $.kw_alter,
            $.kw_package,
            optional($._schema),
            field("obj_name", $.identifier),
            choice(
                $._compile_clause,
                $._editionable_noneditionable,
            ),
            SEMICOLON,
        ),
        alter_procedure: $ => seq(
            $.kw_alter,
            $.kw_procedure,
            optional($._schema),
            field("obj_name", $.identifier),
            choice(
                $._compile_clause,
                $._editionable_noneditionable,
            ),
            SEMICOLON,
        ),
        alter_function: $ => seq(
            $.kw_alter,
            $.kw_function,
            optional($._schema),
            field("obj_name", $.identifier),
            choice(
                $._compile_clause,
                $._editionable_noneditionable,
            ),
            SEMICOLON,
        ),
        alter_trigger: $ => seq(
            $.kw_alter,
            $.kw_trigger,
            optional($._schema),
            field("trigger_name", $.identifier),
            choice(
                $._compile_clause,
                $._editionable_noneditionable,
                $._enable_disable,
                $._rename_to,
            ),
            SEMICOLON,
        ),
        alter_library: $ => seq(
            $.kw_alter,
            $.kw_library,
            optional($._schema),
            field("obj_name", $.identifier),
            choice(
                $._compile_clause,
                $._editionable_noneditionable,
            ),
            SEMICOLON,
        ),
        alter_type: $ => seq(
            $.kw_alter,
            $.kw_type,
            optional($._schema),
            field("type_name", $.identifier),
            choice(
                $._compile_clause,
                $._editionable_noneditionable,
                $.kw_reset,
                $._final_instantiable,
                $.alter_type_replace,
                $._alter_type_alter_x,
            ),
            optional($.dependent_handling_clause),
            SEMICOLON,
        ),
        _alter_type_alter_x: $ => seq(
            choice(
                $.alter_method_spec,
                $.alter_attribute_definition,
                $.alter_collection_clause,
            ),
        ),
        alter_method_spec: $ => seq(
            $.alter_method_spec_element,
            repeat(seq(COMMA, $.alter_method_spec_element)),
        ),
        alter_method_spec_element: $ => seq(
            choice(
                $.kw_add,
                $.kw_drop,
            ),
            choice(
                $.element_spec_map_order_function_spec,
                $.element_spec_subprogram_spec,
            ),
        ),
        alter_collection_clause: $ => seq(
          $.kw_modify,
          choice(
            seq($.kw_limit, $._literal_number),
            seq($.kw_element, $.kw_type, $.datatype),
          ),
        ),
        alter_attribute_definition: $ => choice(
          $.alter_attribute_definition_add_modify,
          $.alter_attribute_definition_drop,
        ),
        alter_attribute_definition_drop: $ => seq(
          $.kw_drop,
          $.kw_attribute,
          $.alter_attribute_definition_attribute,
        ),
        alter_attribute_definition_add_modify: $ => seq(
            choice(
                $.kw_add,
                $.kw_modify,
            ),
            $.kw_attribute,
            $.alter_attribute_definition_attribute_datatype,
        ),
        alter_attribute_definition_attribute: $ => choice(
            $.identifier,
            seq(
                BRACKET_LEFT,
                $.identifier,
                repeat(seq(COMMA, $.identifier)),
                BRACKET_RIGHT,
            ),
        ),
        alter_attribute_definition_attribute_datatype: $ => choice(
            $.alter_attribute_definition_attribute_datatype_element,
            seq(
                BRACKET_LEFT,
                $.alter_attribute_definition_attribute_datatype_element,
                repeat(seq(COMMA, $.alter_attribute_definition_attribute_datatype_element)),
                BRACKET_RIGHT,
            ),
        ),
        alter_attribute_definition_attribute_datatype_element: $ => seq(
            $.identifier,
            $.datatype,
        ),
        alter_type_replace: $ => seq(
            $.kw_replace,
            repeat(
                choice(
                    $.invoker_rights_clause,
                    $.accessible_by_clause,
                ),
            ),
            $.kw_as,
            $.kw_object,
            BRACKET_LEFT,
            $.identifier,
            $.datatype,
            repeat(
                seq(COMMA, $.identifier, $.datatype),
            ),
            repeat(
                seq(COMMA, $.element_spec),
            ),
            BRACKET_RIGHT,
        ),
        element_spec: $ => seq(
            optional($.inheritance_clause),
            repeat1(
                choice(
                    $.element_spec_subprogram_spec,
                    $.element_spec_map_order_function_spec,
                    $.element_spec_constructor_spec,
                ),
            ),
        ),
        element_spec_constructor_spec: $ => seq(
            optional($.kw_final),
            optional($.kw_instantiable),
            $.kw_constructor,
            $.kw_function,
            field("name",$.identifier),
            optional(
                seq(
                    BRACKET_LEFT,
                    optional(
                        seq(
                            $.kw_self,
                            $.kw_in,
                            $.kw_out,
                            $.identifier,
                            COMMA,
                        ),
                    ),
                    $.parameter_declaration_element,
                    repeat(
                        seq(
                            COMMA,
                            $.parameter_declaration_element,
                        ),
                    ),
                    BRACKET_RIGHT,
                ),
            ),
            $.kw_return,
            $.kw_self,
            $.kw_as,
            $.kw_result,
            optional(
                $.element_spec_is_as_call_spec,
            )
        ),
        element_spec_map_order_function_spec: $ => seq(
            choice(
                $.kw_map,
                $.kw_order,
            ),
            $.kw_member,
            $.element_spec_function_spec,
        ),
        element_spec_subprogram_spec: $ => seq(
            choice(
                $.kw_member,
                $.kw_static,
            ),
            choice(
                $.element_spec_procedure_spec,
                $.element_spec_function_spec,
            ),
        ),
        element_spec_procedure_spec: $ => seq(
            $.kw_procedure,
            field("prc_name", $.identifier),
            $.parameter_declaration,
            optional($.element_spec_is_as_call_spec),
        ),
        element_spec_function_spec: $ => seq(
            $.kw_function,
            field("fnc_name", $.identifier),
            $.parameter_declaration,
            $.return_declaration,
            optional($.element_spec_is_as_call_spec),
        ),
        element_spec_is_as_call_spec: $ => seq(
            $._is_as,
            $.call_spec_ext,
        ),
        dependent_handling_clause: $ => choice(
            $.kw_invalidate,
            $._dependent_handling_clause_cascade,

        ),
        _dependent_handling_clause_cascade: $ => seq(
            $.kw_cascade,
            optional(
                choice(
                    $._dependent_handling_clause_convert,
                    $._dependent_handling_clause_including,
                ),
            ),
            optional(
                seq(
                    optional($.kw_force),
                    $.exceptions_clause,
                ),
            )
        ),
        _dependent_handling_clause_including: $ => seq(
            optional($.kw_not),
            $.kw_including,
            $.kw_table,
            $.kw_data,
        ),
        _dependent_handling_clause_convert: $ => seq(
            $.kw_convert,
            $.kw_to,
            $.kw_substitutable,
        ),
        exceptions_clause: $ => seq(
            $.kw_exceptions,
            $.kw_into,
            $.referenced_element,
        ),
        exception_handler: $ => seq(
            $.kw_when,
            choice(
                $.kw_others,
                seq($.referenced_element, repeat(seq($.kw_or,$.referenced_element))),
            ),
            $.kw_then,
            repeat1($.statement),
        ),
        inheritance_clause: $ => seq(
            optional($.kw_not),
            prec(2,choice(
                $.kw_instantiable,
                $.kw_final,
                $.kw_overriding,
            )),
        ),
        _final_instantiable: $ => seq(
            optional($.kw_not),
            choice(
                $.kw_instantiable,
                $.kw_final,
            ),
        ),
        call_spec_ext:$ => choice(
            $.java_declaration,
            $.c_declaration,
        ),
        java_declaration:$ => seq(
            $.kw_language,
            $.kw_java,
            $.kw_name,
            field("name",$.literal_string),
        ),
        c_declaration:$ => seq(
            choice(
                seq($.kw_language, $.kw_c),
                $.kw_external,
            ),
            choice(
                seq($.library_name, optional($.name_name)),
                seq($.name_name, optional($.library_name)),
            ),
            optional($.agent_in),
            optional($.with_context),
            optional($.external_parameters),
        ),
        library_name: $ => seq(
            $.kw_library,
            field("library",$.identifier),
        ),
        name_name: $ => seq(
            $.kw_name,
            $._quoted_identifier,
        ),
        with_context: $ => seq(
            $.kw_with,
            $.kw_context,
        ),
        agent_in: $ => seq(
            $.kw_agent,
            $.kw_in,
            BRACKET_LEFT,
            field("argument",$.identifier),
            repeat(
                seq(COMMA, field("argument",$.identifier))
            ),
            BRACKET_RIGHT,
        ),
        external_parameters: $ => seq(
            $.kw_parameters,
            BRACKET_LEFT,
            $.external_parameter,
            repeat(
                seq(COMMA, $.external_parameter)
            ),
            BRACKET_RIGHT,
        ),
        external_parameter: $ => choice(
            $.kw_context,
            $.external_parameter_self,
            $.external_parameter_param,
        ),
        external_parameter_self: $ => seq(
            $.kw_self,
            choice(
                $.kw_tdo,
                $.external_parameter_property,
            ),
        ),
        external_parameter_param: $ => seq(
            choice(
                $.kw_return,
                $.identifier,
            ),
            optional($.external_parameter_property),
            optional($.by_reference),
            optional($.identifier),
        ),
        external_parameter_property: $ => choice(
            $.kw_length,
            $.kw_duration,
            $.kw_maxlen,
            $.kw_charsetid,
            $.kw_charsetfrom,
            seq($.kw_indicator,optional(choice($.kw_struct,$.kw_tdo))),
        ),
        by_reference: $ => seq(
            $.kw_by,
            $.kw_reference,
        ),
        _compile_clause: $ => seq(
            $.kw_compile,
            optional($.kw_debug),
            optional(
                choice(
                    $.kw_package,
                    $.kw_specification,
                    $.kw_body,
                ),
            ),
            repeat($.compiler_parameter_clause),
            optional($.reuse_settings),
        ),
        compiler_parameter_clause: $ => seq(
            field("compile_parameter_name", $.identifier),
            EQUAL,
            field("compile_parameter_value", $._literal),
        ),
        _editionable_noneditionable: $ => choice(
            $.kw_editionable,
            $.kw_noneditionable,
        ),
        sharing_clause: $ => choice(
            $.kw_metadata,
            $.kw_none,
        ),
        default_collation_clause: $ => seq(
            $.kw_default,
            $.kw_collation,
            choice(
                $.kw_using_nls_comp,
            )
        ),
        invoker_rights_clause: $ => seq(
            $.kw_authid,
            choice(
                $.kw_current_user,
                $.kw_definer,
            )
        ),
        accessible_by_clause: $ => seq(
            $.kw_accessible,
            $.kw_by,
            BRACKET_LEFT,
            $.accessor,
            repeat(
                seq(COMMA, $.accessor),
            ),
            BRACKET_RIGHT,
        ),
        accessor: $ => seq(
            optional($._unit_kind),
            $.referenced_element,
        ),
        _unit_kind: $ => choice(
            $.kw_function,
            $.kw_procedure,
            $.kw_package,
            $.kw_trigger,
            $.kw_type,
        ),
        reuse_settings: $ => seq(
            $.kw_reuse,
            $.kw_settings,
        ),
        _schema: $ => seq(
            field("schema_name",$.identifier),
            POINT,
        ),
        _remote: $ => seq(
            REMOTE,
            field("remote_name",$.identifier),
        ),
        referenced_element: $ => seq(
            optional($._schema),
            choice(
                $._referenced_element_parent,
                $._referenced_element_name,
                $._referenced_element_multi,
            ),
            optional($._remote),
        ),
        _referenced_element_multi: $ => prec(3,
            seq( field("ref_name_parent",$.identifier),
                POINT,
                field("ref_name",$.identifier),
                repeat1(seq(POINT,$.identifier)),
            ),
        ),
        _referenced_element_parent: $ => prec(2,
            seq( field("ref_name_parent",$.identifier),
                POINT,
                field("ref_name",$.identifier),
            ),
        ),
        _referenced_element_subname: $ => seq(
            field("ref_name_sub",$.identifier),
        ),
        _referenced_element_name: $ => seq(
            field("ref_name",$.identifier),
        ),
        byte_char: $ => choice(
            $.kw_byte,
            $.kw_char,
        ),
        _is_as: $ => choice(
            $.kw_is,
            $.kw_as,
        ),
        end_obj: $ => seq(
            $.kw_end,
        ),
        end_obj_named: $ => seq(
            $.kw_end,
            optional($.identifier),
            SEMICOLON,
        ),
        _declare_section_element: $ => choice(
            $._item_list_1,
            $._item_list_ext,
        ),
        _item_list_1: $ => choice(
            $.function_declaration,
            $.procedure_declaration,
            $._type_definition,
            $.cursor_declaration,
            $.item_declaration,
            $.exception_declaration,
        ),
        _item_list_ext: $ => choice(
            $.function_definition,
            $.procedure_definition,
            $.cursor_definition,
        ),
        create_obj: $ => seq(
            $.kw_create,
            optional(
                seq(
                    $.kw_or,
                    $.kw_replace,
                ),
            ),
        ),
        procedure_definition: $ => seq(
            $.kw_procedure,
            field("prc_name", $.identifier),
            optional($.parameter_declaration),
            repeat($._procedure_properties),
            $._is_as,
            choice(
                $.call_spec_ext,
                seq(repeat($._declare_section_element),$.body),
            ),
        ),
        procedure_declaration: $ => seq(
            $.kw_procedure,
            field("prc_name", $.identifier),
            optional($.parameter_declaration),
            repeat($._procedure_properties),
            SEMICOLON,
        ),
        _procedure_properties: $ => choice(
            $.default_collation_clause,
            $.invoker_rights_clause,
            $.accessible_by_clause,
        ),
        function_definition: $ => seq(
            $.kw_function,
            field("fnc_name", $.identifier),
            optional($.parameter_declaration),
            $.return_declaration,
            repeat($._function_properties),
            $._is_as,
            choice(
                $.call_spec_ext,
                seq(repeat($._declare_section_element),$.body),
            ),
        ),
        function_declaration: $ => seq(
            $.kw_function,
            field("fnc_name", $.identifier),
            optional($.parameter_declaration),
            $.return_declaration,
            optional($._function_properties),
            SEMICOLON,
        ),
        _function_properties: $ => choice(
            $.kw_deterministic,
            $.kw_pipelined,
            $.kw_parallel_enable,
            $.kw_result_cache,
        ),
        exception_declaration: $ => seq(
            $.identifier,
            $.kw_exception,
            SEMICOLON,
        ),
        item_declaration: $ => seq(
            $.identifier,
            optional($.kw_constant),
            $.datatype,
            optional($._not_null),
            optional($.default_expression),
            SEMICOLON,
        ),
        plsql_block: $ => seq(
            optional(seq($.kw_declare,repeat1($._declare_section_element))),
            $.body,
        ),
        body: $ => seq(
            $.kw_begin,
            repeat1($.statement),
            optional($.exception_block),
            $.end_obj,
        ),
        exception_block: $ => seq(
            $.kw_exception,
            repeat1($.exception_handler),
        ),
        statement: $ => seq(
            optional($.label),
            $._statement_element,
            SEMICOLON,
        ),
        _statement_element: $ => choice(
            prec(8,$.assignment_statement),
            $.if_statement,
            $.basic_loop_statement,
            $.case_statement,
            $.close_statement,
            $.referenced_element_point_method_call,
            $.continue_statement,
            $.execute_immediate,
            $.exit_statement,
            $.fetch_statement,
            $.for_loop_statement,
            // TODO
            // $._forall_statement,
            $.goto_statement,
            $.null_statement,
            $.open_statement,
            $.open_for_statement,
            $.pipe_row_statement,
            $.plsql_block,
            $.ref_call,
            $.referenced_element,
            $.raise_statement,
            $.return_statement,
            $._sql_statements,
            $.while_loop_statement,
        ),
        assignment_statement: $ => seq(
            $._assignment_statement_target,
            ASSIGNMENT,
            $.expression,
        ),
        _assignment_statement_target: $ => choice(
            $.referenced_element,
            $.host_variable,
            $.collection_variable,
        ),
        collection_variable: $ => seq(
            $.referenced_element,
            choice(
                $._index,
                seq(BRACKET_LEFT,$.referenced_element,BRACKET_RIGHT),
            ),
        ),
        label: $ => seq(
            LABEL_START,
            $.identifier,
            LABEL_END
        ),
        basic_loop_statement: $ => seq(
            $.kw_loop,
            repeat1($.statement),
            $.kw_end,
            $.kw_loop,
            optional($.label),
        ),
        case_statement: $ => choice(
           $._simple_case_statement,
           $._searched_case_statement,
        ),
        _searched_case_statement: $ => seq(
            $.kw_case,
            repeat1(
                seq($.kw_when, $.expression, $.kw_then, repeat1($.statement)),
            ),
            optional(
                seq($.kw_else, repeat1($.statement)),
            ),
            $.kw_end,
            $.kw_case,
            optional($.label),
        ),
        _simple_case_statement: $ => seq(
            $.kw_case,
            $.referenced_element,
            repeat1(
                seq($.kw_when, $.expression, $.kw_then, repeat1($.statement)),
            ),
            optional(
                seq($.kw_else, repeat1($.statement)),
            ),
            $.kw_end,
            $.kw_case,
            optional($.label),
        ),
        close_statement: $ => seq(
            $.kw_close,
            choice(
                $.referenced_element,
                $.host_variable,
            ),
        ),
        continue_statement: $ => seq(
            $.kw_continue,
            optional($.label),
            optional(seq($.kw_when,$.expression)),
        ),
        fetch_statement: $ => seq(
            $.kw_fetch,
            $._assignment_statement_target,
            $._into_and_bulk_clause,
        ),
        exit_statement: $ => seq(
            $.kw_exit,
            optional($.label),
            optional(seq($.kw_when,$.expression)),
        ),
        return_statement: $ => seq(
            $.kw_return,
            optional($.expression),
        ),
        raise_statement: $ => seq(
            $.kw_raise,
            $.referenced_element,
        ),
        pipe_row_statement: $ => seq(
            $.kw_pipe,
            $.kw_row,
            BRACKET_LEFT,
            $.referenced_element,
            BRACKET_RIGHT,
        ),
        null_statement: $ => seq(
            $.kw_null,
        ),
        _sql_statements: $ => choice(
            $.sql_statement_commit,
            $.sql_statement_rollback,
            $.sql_statement_savepoint,
            $.sql_statement_set_transaction,
            $.sql_statement_lock_table,
            $.select,
            $.delete,
            $.update,
        ),
        sql_statement_lock_table: $ => seq(
            $.kw_lock,
            $.kw_table,
            $.referenced_element,
            optional($._partition_extension_clause),
            $.kw_in,
            repeat1($.identifier),
            $.kw_mode,
            choice(
                $.kw_nowait,
                seq($.kw_wait,$.number),
            ),
        ),
        sql_statement_rollback: $ => seq(
            $.kw_rollback,
            optional($.kw_work),
            optional(
                choice(
                    seq($.kw_to,optional($.kw_savepoint),$.identifier),
                    seq($.kw_comment,$.literal_string),
                ),
            ),
        ),
        sql_statement_commit: $ => seq(
            $.kw_commit,
            optional($.kw_work),
            optional(
                choice(
                    seq($.kw_force,$.literal_string,optional(seq(COMMA,$.number))),
                    seq($.kw_comment,$.literal_string,
                        optional(seq($.kw_write,optional(choice($.kw_wait,$.kw_nowait)),
                            optional(choice($.kw_immediate,$.kw_batch))),
                        ),
                    ),
                ),
            ),
        ),
        sql_statement_savepoint: $ => seq(
            $.kw_savepoint,
            $.identifier,
        ),
        sql_statement_set_transaction: $ => seq(
            $.kw_set,
            $.kw_transaction,
            repeat(
                choice(
                    seq($.kw_read,choice($.kw_only,$.kw_write)),
                    seq($.kw_isolation,$.kw_level,choice($.kw_serializable,seq($.kw_read,$.kw_commtted))),
                    seq($.kw_use,$.kw_rollback,$.kw_segment,$.identifier),
                ),
            ),
            optional(seq($.kw_name,$.identifier)),
        ),
        while_loop_statement: $ => seq(
            $.kw_while,
            $.expression,
            $.kw_loop,
            repeat1($.statement),
            $.kw_end,
            $.kw_loop,
            optional($.label),
        ),
        for_loop_statement: $ => seq(
            $.kw_for,
            $.iterator,
            $.kw_loop,
            repeat1($.statement),
            $.kw_end,
            $.kw_loop,
            optional($.label),
        ),
        iterator: $ => seq(
            $._iterand_decl,
            optional(seq(COMMA,$._iterand_decl)),
            $.kw_in,
            $._iterator_ctl_seq,
        ),
        _iterand_decl: $ => seq(
            $.identifier,
            optional(choice($.kw_mutable,$.kw_immutable)),
        ),
        _iterator_ctl_seq: $ => seq(
            $._qual_iteration_ctl,
            optional(seq(COMMA, $._qual_iteration_ctl)),
        ),
        _qual_iteration_ctl: $ => seq(
            optional($.kw_reverse),
            $._iteration_control,
            optional($._pred_clause_seq),
        ),
        _iteration_control: $ => choice(
            // TODO
            $._iteration_stepped_control,
            $._single_expression_control,
            $._xy_of_control,
        ),
        _iteration_stepped_control: $ => seq(
            $.number,
            POINT_POINT,
            $.number,
            optional(seq($.kw_by,$._literal_number)),
        ),
        _xy_of_control: $ => seq(
            choice($.kw_indices,$.kw_values,$.kw_pairs),
            $.kw_of,
            $.expression,
        ),
        _single_expression_control: $ => seq(
            optional($.kw_repeat),
            $.expression,
        ),
        _pred_clause_seq: $ => choice(
            seq($.kw_while,$.expression),
            seq($.kw_when,$.expression),
            seq($.kw_while,$.expression,$.kw_when,$.expression),
        ),
        if_statement: $ => seq(
            $.kw_if,
            $.expression,
            $.kw_then,
            repeat1($.statement),
            repeat(seq($.kw_elsif, $.expression, $.kw_then, repeat1($.statement))),
            optional(seq($.kw_else, repeat1($.statement))),
            prec(4,$.end_if),
        ),
        end_if: $ => seq(
            $.kw_end,
            $.kw_if,
        ),
        goto_statement: $ => seq(
            $.kw_goto,
            $.label,
        ),
        open_statement: $ => seq(
            $.kw_open,
            $.referenced_element,
            optional($.parameter),
        ),
        open_for_statement: $ => seq(
            $.kw_open,
            $._assignment_statement_target,
            $.kw_for,
            $.select,
            optional($._using_clause),
        ),
        execute_immediate: $ => seq(
            $.kw_execute,
            $.kw_immediate,
            $.expression,
            optional(
                choice(
                    seq($._using_clause, optional($._dynamic_returning_clause)),
                    $._dynamic_returning_clause,
                    seq($._into_and_bulk_clause, optional($._using_clause)),
                ),
            ),
        ),
        _error_logging_clause: $ => seq(
            $.kw_log,
            $.kw_errors,
            optional(seq($.kw_into,$.referenced_element)),
            optional(seq(BRACKET_LEFT,$.expression,BRACKET_RIGHT)),
            optional($._modified_external_table_properties_reject),
        ),
        _returning_clause: $ => seq(
            choice(
                $.kw_return,
                $.kw_returning,
            ),
            $.expression,
            repeat(seq(COMMA,$.expression)),
            $.kw_into,
            $.referenced_element,
            repeat(seq(COMMA,$.referenced_element)),
        ),
        _dynamic_returning_clause: $ => seq(
            choice(
                $.kw_return,
                $.kw_returning,
            ),
            $._into_and_bulk_clause,
        ),
        _using_clause: $ => seq(
            $.kw_using,
            $._using_clause_element,
            repeat(
                seq(COMMA, $._using_clause_element),
            ),
        ),
        _using_clause_element: $ => seq(
            choice(
                $.kw_in,
                $.kw_out,
                seq($.kw_in,$.kw_out),
            ),
            $.referenced_element,
        ),
        // cursor_for_loop_statement: $ => seq(
        //     $.kw_for,
        //     $.identifier,
        //     $.kw_in,
        //     choice(
        //         seq($.referenced_element, $.parameter),
        //         seq(BRACKET_LEFT, $.select, BRACKET_RIGHT),
        //     ),
        //     $.kw_loop,
        //     repeat1($.statement),
        //     $.kw_end,
        //     $.kw_loop,
        //     optional($.label),
        // ),
        cursor_definition: $ => seq(
            $.kw_cursor,
            $.identifier,
            optional($.cursor_declaration_parameters),
            optional(seq($.kw_return, $._cursor_declaration_return_datatype)),
            $.kw_is,
            $.select,
            SEMICOLON
        ),
        cursor_declaration: $ => seq(
            $.kw_cursor,
            $.identifier,
            optional($.cursor_declaration_parameters),
            $.kw_return,
            $._cursor_declaration_return_datatype,
            SEMICOLON
        ),
        _cursor_declaration_return_datatype: $ => choice(
            $._referenced_datatypes,
            $.identifier,
        ),
        cursor_declaration_parameters: $ => seq(
            BRACKET_LEFT,
            $.cursor_declaration_parameter,
            repeat(seq(COMMA, $.cursor_declaration_parameter)),
            BRACKET_RIGHT,
        ),
        cursor_declaration_parameter: $ => seq(
            $.identifier,
            optional($.kw_in),
            $.datatype,
            optional($.default_expression),
        ),
        _type_definition: $ => choice(
            $.type_definition_sub,
            $.type_definition_ref_cursor_return,
            $.type_definition_record,
            $.type_definition_collection,
        ),
        type_definition_collection: $ => seq(
            $.kw_type,
            field("type_collection_name", $.identifier),
            $.kw_is,
            choice(
                $.type_definition_assoc_array,
                $.type_definition_nested_table,
                $.type_definition_varray,
            ),
            SEMICOLON,
        ),
        type_definition_varray: $ => seq(
            choice(
                $.kw_varray,
                seq(
                    optional($.kw_varying),
                    $.kw_array,
                ),
            ),
            $._size,
            $.kw_of,
            $.datatype,
            optional($._not_null),
        ),
        type_definition_nested_table: $ => seq(
            $.kw_table,
            $.kw_of,
            $.datatype,
            optional($._not_null),
        ),
        type_definition_assoc_array: $ => seq(
          $.kw_table,
          $.kw_of,
          $.datatype,
          optional($._not_null),
          $.kw_index,
          $.kw_by,
          $.type_definition_assoc_array_datatypes,
        ),
        type_definition_assoc_array_datatypes: $ => choice(
          $.kw_pls_integer,
          $.kw_binary_integer,
          $.kw_long,
          $._referenced_datatypes,
          seq(
            choice(
              $.kw_varchar2,
              $.kw_varchar,
              $.kw_string,
            ),
            $._size_byte_char,
          ),
        ),
        type_definition_record: $ => seq(
            $.kw_type,
            field("type_rec_name", $.identifier),
            $.kw_is,
            $.kw_record,
            BRACKET_LEFT,
            $.field_definition,
            repeat(seq(COMMA,$.field_definition)),
            BRACKET_RIGHT,
            SEMICOLON,
        ),
        field_definition: $ => seq(
            $.identifier,
            $.datatype,
            optional($._not_null),
            optional($.default_expression),
        ),
        type_definition_ref_cursor: $ => seq(
            $.kw_type,
            field("ref_cursor_name", $.identifier),
            $.kw_is,
            $.kw_ref,
            $.kw_cursor,
            optional($.type_definition_ref_cursor_return),
            SEMICOLON,
        ),
        type_definition_ref_cursor_return: $ => seq(
            $.kw_return,
            choice(
                $._referenced_datatypes,
                $.referenced_element,
            ),
        ),
        type_definition_sub: $ => seq(
            $.kw_subtype,
            field("subtype_name", $.identifier),
            $.kw_is,
            $.datatype,
            repeat(
                choice(
                    $.type_range,
                    $.character_set,
                ),
            ),
            optional($._not_null),
            SEMICOLON,
        ),
        character_set: $ => seq(
            $.kw_character,
            $.kw_set,
            $.literal_string,
        ),
        type_range: $ => seq(
            $.kw_range,
            $._literal_number,
            RANGE,
            $._literal_number,
        ),
        _is_null_or_is_not_null: $ => choice(
            $._is_null,
            $._is_not_null,
        ),
        _is_null: $ => seq(
            $.kw_is,
            $.kw_null,
        ),
        _is_not_null: $ => seq(
            $.kw_is,
            $.kw_not,
            $.kw_null,
        ),
        _not_null: $ => seq(
            $.kw_not,
            $.kw_null,
        ),
        expression: $ => choice(
            prec(4,$._expression_element),
            prec(1,seq(BRACKET_LEFT, $.expression, BRACKET_RIGHT)),
        ),
        _expression_element: $ => choice(
            prec(4,$._expression_base_elements),
            prec(3,$._expression_base_operator_not_boolean),
            prec(2,$._expression_base_boolean),
            prec(1,$._expression_base_case),
        ),
        _expression_base_elements: $ => choice(
            prec(8,$.ref_call),
            prec(7,$.referenced_element_point_method_call),
            prec(6,$._referenced_element_percent_method_call),
            prec(5,$.referenced_element),
            prec(4,$._literal),
            prec(3,$._literal_list_multi),
            prec(2,$.placeholder),
        ),
        _expression_base_operator_not_boolean: $ => seq(
            $._expression_base_elements,
            repeat1(
                seq(
                    $._expression_operator_not_boolean,
                    $._expression_base_elements,
                ),
            ),
        ),
        _expression_base_case: $ => choice(
           $.expression_base_case_search,
           $.expression_base_case_simple,
        ),
        expression_base_case_search: $ => seq(
            $.kw_case,
            repeat1(
                seq($.kw_when, $.expression, $.kw_then, $.expression),
            ),
            optional(
                seq($.kw_else, $.expression),
            ),
            $.kw_end,
        ),
        expression_base_case_simple: $ => seq(
            $.kw_case,
            $.referenced_element,
            repeat1(
                seq($.kw_when, $.expression, $.kw_then, $.expression),
            ),
            optional(
                seq($.kw_else, $.expression),
            ),
            $.kw_end,
        ),
        _expression_base_boolean: $ => prec.left(
            seq(
                optional($.kw_not),
                $._expression_base_boolean_elements,
                repeat($._expression_base_boolean_repeat),
            ),
        ),
        _expression_base_boolean_elements: $ => choice(
            seq(
                $._expression_base_elements,
                choice(
                    $._expression_base_boolean_operator,
                    $._expression_base_boolean_between,
                    $._expression_base_boolean_in,
                    $._expression_base_boolean_like,
                    $._is_null_or_is_not_null,
                ),
            ),
            $._conditional_predicate,
            $.ref_call,
            $.referenced_element,
        ),
        _expression_base_boolean_repeat: $ => seq(
            choice(
                $.kw_and,
                $.kw_or,
            ),
            $._expression_base_boolean,
        ),
        _expression_base_boolean_operator: $ => seq(
            $._expression_operator_boolean,
            $._expression_base_elements
        ),
        _expression_base_boolean_in: $ => seq(
            optional($.kw_not),
            $.kw_in,
            $.expression,
        ),
        _expression_base_boolean_like: $ => seq(
            optional($.kw_not),
            $.kw_like,
            choice(
                $.identifier,
                $.literal_string,
            ),
        ),
        _expression_base_boolean_between: $ => seq(
            optional($.kw_not),
            $.kw_between,
            $.expression,
            $.kw_and,
            $.expression,
        ),
        _referenced_element_percent_method_call: $ => seq(
            $.referenced_element,
            PERCENT,
            choice(
                $.kw_rowcount,
                $.kw_found,
                $.kw_isopen,
                $.kw_notfound,
            ),
        ),
        referenced_element_point_method_call: $ => seq(
            $.referenced_element,
            POINT,
            choice(
                $.kw_count,
                $.kw_delete,
                $.kw_first,
                $.kw_last,
                $.kw_limit,
                $.kw_next,
                $.kw_prior,
                $.kw_exists,
                $.kw_extend,
                $.kw_trim,
            ),
            optional($._index),
        ),
        _conditional_predicate: $ => choice(
            $.kw_inserting,
            $.kw_deleting,
            seq(
                $.kw_updating,
                optional(
                    seq(
                        BRACKET_LEFT,
                        $.literal_string,
                        BRACKET_RIGHT,
                    ),
                ),
            ),
        ),
        return_declaration: $ => seq(
            $.kw_return,
            $.datatype,
        ),
        datatype: $ => choice(
            $._character_datatypes,
            $._number_datatypes,
            $._long_and_raw_datatypes,
            $._datetime_datatypes,
            $._large_object_datatypes,
            $._rowid_datatypes,
            $._logical_datatypes,
            $._referenced_datatypes,
            $._supplied_datatypes_any_types,
            $._supplied_datatypes_xml_types,
            $._supplied_datatypes_spatial_types,
            $._object_datatypes,
            $._other_datatypes,
            $.referenced_element,
            // TODO user_defined_types
        ),
        _character_datatypes: $ => choice(
            $._character_datatypes_char,
            $._character_datatypes_varchar2,
            $._character_datatypes_nchar,
            $._character_datatypes_nvarchar2,
            $._ansi_supported_datatypes_character,
            $._ansi_supported_datatypes_char_nchar,
            $._ansi_supported_datatypes_varchar,
            $._ansi_supported_datatypes_national,
        ),
        _character_datatypes_char: $ => seq(
            $.kw_char,
            optional($._size_byte_char),
        ),
        _character_datatypes_varchar2: $ => seq(
            $.kw_varchar2,
            optional($._size_byte_char),
        ),
        _character_datatypes_nchar: $ => seq(
            $.kw_nchar,
            optional($._size),
        ),
        _character_datatypes_nvarchar2: $ => seq(
            $.kw_nvarchar2,
            optional($._size),
        ),
        _number_datatypes: $ => choice(
            $._number_datatypes_number,
            $._number_datatypes_float,
            $._number_datatypes_keyword,
            $._ansi_supported_datatypes_numeric_decimal_dec,
            $._ansi_supported_datatypes_double_precision,
        ),
        _number_datatypes_keyword: $ => choice(
            $.kw_int,
            $.kw_smallint,
            $.kw_real,
            $.kw_binary_float,
            $.kw_binary_double,
            $.kw_simple_float,
            $.kw_simple_double,
            $.kw_binary_integer,
            $.kw_pls_integer,
            $.kw_natural,
            $.kw_naturaln,
            $.kw_positive,
            $.kw_positiven,
            $.kw_signtype,
            $.kw_simple_integer,
            $.kw_integer,
        ),
        _number_datatypes_number: $ => seq(
            $.kw_number,
            optional($._size_precision_scale),
        ),
        _number_datatypes_float: $ => seq(
            $.kw_float,
            optional($._size),
        ),
        _long_and_raw_datatypes: $ => choice(
            $._long_and_raw_datatypes_long_raw,
            $._long_and_raw_datatypes_raw,
        ),
        _long_and_raw_datatypes_long_raw: $ => seq(
            $.kw_long,
            optional($.kw_raw),
        ),
        _long_and_raw_datatypes_raw: $ => seq(
            $.kw_raw,
            $._size,
        ),
        _datetime_datatypes: $ => choice(
            $._datetime_datatypes_keyword,
            $._datetime_datatypes_date_timestamp,
            $._datetime_datatypes_date_interval_year,
            $._datetime_datatypes_date_interval_day,
        ),
        _datetime_datatypes_keyword: $ => choice(
            $.kw_date,
        ),
        _datetime_datatypes_date_timestamp: $ => seq(
            $.kw_timestamp,
            optional($._size),
            optional(
                seq(
                    $.kw_with,
                    optional(
                        $.kw_local,
                    ),
                    $.kw_time,
                    $.kw_zone,
                ),
            ),
        ),
        _datetime_datatypes_date_interval_year: $ => seq(
            $.kw_interval,
            $.kw_year,
            optional($._size),
            $.kw_to,
            $.kw_month,
        ),
        _datetime_datatypes_date_interval_day: $ => seq(
            $.kw_interval,
            $.kw_day,
            optional($._size),
            $.kw_to,
            $.kw_second,
            optional($._size),
        ),
        _large_object_datatypes: $ => choice(
            $.kw_blob,
            $.kw_clob,
            $.kw_nclob,
            $.kw_bfile,
        ),
        _rowid_datatypes: $ => choice(
            $.kw_rowid,
            $._rowid_datatypes_urowid,
        ),
        _referenced_datatypes: $ => choice(
            $._referenced_datatypes_type,
            $._referenced_datatypes_rowtype,
        ),
        _referenced_datatypes_type: $ => seq(
            $.referenced_element,
            $.kw_datatype_type,
        ),
        _referenced_datatypes_rowtype: $ => seq(
            $.referenced_element,
            $.kw_datatype_rowtype,
        ),
        _logical_datatypes: $ => choice(
            $.kw_boolean,
        ),
        _rowid_datatypes_urowid: $ => seq(
            $.kw_urowid,
            optional($._size),
        ),
        _ansi_supported_datatypes_character: $ => seq(
            $.kw_character,
            optional($.kw_varying),
            $._size,
        ),
        _ansi_supported_datatypes_char_nchar: $ => seq(
            choice(
                $.kw_char,
                $.kw_nchar,
            ),
            $.kw_varying,
            $._size,
        ),
        _ansi_supported_datatypes_varchar: $ => seq(
            $.kw_varchar,
            $._size,
        ),
        _ansi_supported_datatypes_national: $ => seq(
            $.kw_varchar,
            choice(
                $.kw_char,
                $.kw_character,
            ),
            optional($.kw_varying),
            $._size,
        ),
        _ansi_supported_datatypes_numeric_decimal_dec: $ => seq(
            choice(
                $.kw_numeric,
                $.kw_decimal,
                $.kw_dec,
            ),
            optional($._size_precision_scale),
        ),
        _ansi_supported_datatypes_float: $ => seq(
            $.kw_float,
            optional($._size),
        ),
        _ansi_supported_datatypes_double_precision: $ => seq(
            $.kw_double,
            $.kw_precision,
        ),
        _supplied_datatypes_any_types: $ => seq(
            $.kw_sys,
            POINT,
            choice(
                $.kw_anydata,
                $.kw_anytype,
                $.kw_anydataset,
            ),
        ),
        _supplied_datatypes_xml_types: $ => choice(
            $.kw_xmltype,
            $.kw_uritype,
        ),
        _supplied_datatypes_spatial_types: $ => choice(
            $.kw_sdo_geometry,
            $.kw_sdo_topo_geometry,
            $.kw_sdo_georaster,
        ),
        _object_datatypes: $ => choice(
            $.kw_json_element_t,
            $.kw_json_array_t,
            $.kw_json_object_t,
            $.kw_json_scalar_t,
            $.kw_json_key_list,
        ),
        _other_datatypes: $ => choice(
            $.exception_declaration,
        ),
        ref_call: $ => seq(
            prec(5,$.referenced_element),
            $.parameter,
            optional(seq(POINT,$.referenced_element)),
        ),
        parameter_declaration: $ => seq(
            BRACKET_LEFT,
            $.parameter_declaration_element,
            repeat(seq(COMMA,$.parameter_declaration_element)),
            BRACKET_RIGHT,
        ),
        parameter_declaration_element: $ => seq(
            $.identifier,
            choice(
                $._parameter_declaration_element_in,
                $._parameter_declaration_element_in_out_or_out,
            ),
        ),
        _parameter_declaration_element_in: $ => seq(
            optional($.kw_in),
            $.datatype,
            optional($.default_expression),
        ),
        _parameter_declaration_element_in_out_or_out: $ => seq(
            optional($.kw_in),
            $.kw_out,
            optional($.kw_nocopy),
            $.datatype,
        ),
        default_expression: $ => seq(
            choice(
                $.kw_default,
                ASSIGNMENT,
            ),
            $.expression,
        ),
        parameter: $ => seq(
            BRACKET_LEFT,
            $.parameter_element,
            repeat(seq(COMMA, $.parameter_element)),
            BRACKET_RIGHT,
        ),
        parameter_element: $ => seq(
            choice(
                $._parameter_element_positional,
                $._parameter_element_named,
            ),
        ),
        _parameter_element_positional: $ => seq(
            $.parameter_value,
        ),
        _parameter_element_named: $ => seq(
            $.parameter_name,
            ASSOCIATION,
            $.parameter_value,
        ),
        parameter_name: $ => choice(
            $.identifier,
        ),
        parameter_value: $ => choice(
            prec(4,$.referenced_element),
            prec(3,$._literal),
            $.expression,
        ),
        _index: $ => prec(1,seq(
            BRACKET_LEFT,
            $._literal_number,
            BRACKET_RIGHT,
        )),
        _size: $ => seq(
            BRACKET_LEFT,
            $._literal_number,
            BRACKET_RIGHT,
        ),
        _size_byte_char: $ => seq(
            BRACKET_LEFT,
            $._literal_number,
            optional($.byte_char),
            BRACKET_RIGHT,
        ),
        _size_precision_scale: $ => seq(
            BRACKET_LEFT,
            $._precision,
            optional(seq(COMMA,$._scale)),
            BRACKET_RIGHT,
        ),
        _precision: $ => seq(
            $._literal_number,
        ),
        _scale: $ => choice(
            $._literal_number,
        ),
        _sign_pos_neg: $ => choice(
            PLUS,
            MINUS,
        ),
        _enable_disable: $ => choice(
            $.kw_enable,
            $.kw_disable,
        ),
        _rename_to: $ => seq(
            $.kw_rename,
            $.kw_to,
            $.identifier,
        ),
        _expression_operator_boolean: $ => choice(
            NOT_EQUAL_1,
            NOT_EQUAL_2,
            NOT_EQUAL_3,
            NOT_EQUAL_4,
            LESS_THEN_EQUAL,
            GREATER_THEN_EQUAL,
            LESS_THEN,
            GREATER_THEN,
            EQUAL,
        ),
        _expression_operator_not_boolean: $ => choice(
            CONCAT,
            EXPONENT,
            PLUS,
            MINUS,
            MULTIPLICATION,
            DIVISON,
        ),
        placeholder: $ => prec.right(
            seq(
                $.host_variable,
                optional($.indicator_variable),
            ),
        ),
        indicator_variable: $ => seq(
            DOUBLE_POINT,
            $.identifier,
        ),
        host_variable: $ => seq(
            DOUBLE_POINT,
            $.identifier,
        ),
        identifier: $ => choice(
            $._unquoted_identifier,
            $._quoted_identifier
        ),
        _unquoted_identifier: $ => /[a-zA-Z][a-zA-Z0-9_$#]*/,
        _quoted_identifier: $ => choice(
            seq('"', field("name", /(""|[^"])*/), '"'), // ANSI QUOTES
        ),
        _referenced_element_list: $ => seq(
            BRACKET_LEFT,
            $.referenced_element_repeat,
            BRACKET_RIGHT,
        ),
        referenced_element_repeat: $ => seq(
            $.referenced_element,
            repeat(seq(COMMA, $.referenced_element)),
        ),
        _identifier_list: $ => seq(
            BRACKET_LEFT,
            $.identifier_list_repeat,
            BRACKET_RIGHT,
        ),
        identifier_list_repeat: $ => seq(
            $.identifier,
            repeat(seq(COMMA, $.identifier)),
        ),
        _literal_list: $ => seq(
            BRACKET_LEFT,
            $.literal_list_repeat,
            BRACKET_RIGHT,
        ),
        _literal_list_multi: $ => seq(
            BRACKET_LEFT,
            $.literal_list_repeat_min,
            BRACKET_RIGHT,
        ),
        literal_list_repeat: $ => seq(
            $._literal,
            repeat(
                seq(COMMA, $._literal),
            ),
        ),
        literal_list_repeat_min: $ => seq(
            $._literal,
            repeat1(
                seq(COMMA, $._literal),
            ),
        ),
        _literal: $ => prec(2,choice(
            $._literal_number,
            $.literal_string,
            $._literal_boolean,
        )),
        _literal_boolean: $ => choice(
            $.kw_true,
            $.kw_false,
            $.kw_null,
        ),
        _literal_number: $ => seq(
            optional($._sign_pos_neg),
            choice(
                prec(1,$.float),
                $.number,
            ),
        ),
        literal_string: $ => choice(
            $._single_quote_string,
        ),
        _single_quote_string: $ => /'([^']''|''[^']|[^'])*'/,
        number: $ => /\d+/,
        float: $ => /\d*[.]\d+/,
        comment_ml: $ => token(
            seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")
        ),
        comment_sl: $ => token(
            seq("--", /.*/)
        ),
        update: $ => seq(
            $.kw_update,
            choice(
                $._table_reference,
                seq(BRACKET_LEFT,$._table_reference,BRACKET_RIGHT),
            ),
            optional($.update_set_clause),
            optional($.where_clause),
            optional($._returning_clause),
            optional($._error_logging_clause),
        ),
        update_set_clause: $ => seq(
            $.kw_set,
            $.update_set_clause_elements,
            repeat(seq(COMMA,$.update_set_clause_elements)),
        ),
        update_set_clause_elements: $ => choice(
            $._update_set_clause_value,
            $._update_set_clause_column,
            $._update_set_clause_select,
        ),
        _update_set_clause_column: $ => seq(
            $.identifier,
            EQUAL,
            choice($.expression,$.kw_default),
        ),
        _update_set_clause_select: $ => seq(
            $._identifier_list,
            EQUAL,
            BRACKET_LEFT,
            $.select,
            BRACKET_RIGHT,
        ),
        _update_set_clause_value: $ => seq(
            $.kw_value,
            BRACKET_LEFT,
            $.identifier,
            BRACKET_RIGHT,
            EQUAL,
            $.expression,
        ),
        delete: $ => seq(
            $.kw_delete,
            optional($.kw_from),
            choice(
                $._table_reference,
                seq(BRACKET_LEFT,$._table_reference,BRACKET_RIGHT),
            ),
            optional($.where_clause),
            optional($._returning_clause),
            optional($._error_logging_clause),
        ),
        select: $ => seq(
            $._subquery,
            optional($.for_update_clause),
        ),
        _subquery: $ => seq(
            choice(
                $._subquery_element,
            ),
            optional($.order_by_clause),
            repeat($.row_limiting_clause),
        ),
        _subquery_element: $ => choice(
            // prec(4,seq($._query_block,SEMICOLON)),
            prec(3,seq($._query_block)),
            repeat1($._subquery_element_union_intersect_minus),
            seq(BRACKET_LEFT, $._subquery, BRACKET_RIGHT),
        ),
        _query_block: $ => seq(
            optional($.with_clause),
            $.kw_select,
            optional(choice($.kw_distinct,$.kw_unique,$.kw_all)),
            $.select_list,
            optional($._into_and_bulk_clause),
            $.kw_from,
            $.table_list,
            optional($.where_clause),
            optional($.hierachical_query_clause),
            optional($.group_by_clause),
            optional($.having_clause),
        ),
        _into_and_bulk_clause: $ => choice(
            $.into_clause,
            $.bulk_collect_into,
        ),
        bulk_collect_into: $ => seq(
            $.kw_bulk,
            $.kw_collect,
            $.kw_into,
            $.referenced_element_repeat,
            optional(seq($.kw_limit,$.expression)),
        ),
        into_clause: $ => seq(
            $.kw_into,
            $.referenced_element_repeat,
        ),
        select_list: $ => seq(
            $.select_list_element,
            repeat(seq(COMMA, $.select_list_element)),
        ),
        select_list_element: $ => choice(
            $.kw_asterisk,
            seq($.referenced_element,POINT,$.kw_asterisk),
            seq($.expression, optional($.kw_as),optional($.identifier)),
        ),
        where_clause: $ => seq(
            $.kw_where,
            $.expression,
        ),
        group_by_clause: $ => seq(
            $.kw_group,
            $.kw_by,
            $.expression,
            repeat(seq(COMMA,$.expression)),
        ),
        having_clause: $ => seq(
            $.kw_having,
            $.expression,
        ),
        hierachical_query_clause: $ => choice(
            $._hierachical_query_clause_connect_by,
            $._hierachical_query_clause_start_with,
        ),
        _hierachical_query_clause_start_with: $ => seq(
            $.kw_start,
            $.kw_with,
            $.expression,
            $.kw_connect,
            $.kw_by,
            optional($.kw_nocycle),
            $.expression,
        ),
        _hierachical_query_clause_connect_by: $ => seq(
            $.kw_connect,
            $.kw_by,
            optional($.kw_nocycle),
            $.expression,
            optional(seq($.kw_start,$.kw_with, $.expression)),
        ),
        table_list: $ => seq(
            $.table_list_element,
            repeat(seq(COMMA, $.table_list_element)),
        ),
        table_list_element: $ => choice(
            $._table_reference,
            $._inline_analytic_view,
            $.join_clause,
            seq(BRACKET_LEFT,$.join_clause,BRACKET_RIGHT),
        ),
        join_clause: $ => seq(
            $._table_reference,
            repeat1(
                choice(
                    $._inner_cross_join_clause,
                    $._outer_join_clause,
                    $._cross_outer_apply_clause,
                ),
            ),
        ),
        _cross_outer_apply_clause: $ => seq(
            choice($.kw_cross, $.kw_outer),
            $.kw_apply,
            $.kw_join,
            choice(
                $._table_reference,
                // $._collection_expression,
            ),
        ),
        _outer_join_clause: $ => seq(
            optional($._query_partiion_clause),
            optional($.kw_natural),
            $.outer_join_type,
            $.kw_join,
            $._table_reference,
            optional($._query_partiion_clause),
            optional($._join_on_using),
        ),
        outer_join_type: $ => seq(
            choice(
                $.kw_full,
                $.kw_left,
                $.kw_right,
            ),
            optional($.kw_outer),
        ),
        _query_partiion_clause: $ => seq(
            $.kw_partition,
            $.kw_by,
            seq($.expression, repeat(seq(COMMA, $.expression))),
        ),
        _table_reference: $ => seq(
            choice(
                $._query_table_expression,
                $._container_clause,
                $._shards_clause,
            ),
            optional(field("alias",$.identifier)),
        ),
        _query_table_expression: $ => choice(
            $._query_table_expression_ref_element,
            $._query_table_expression_lateral,
            // $._table_collection_expression,
        ),
        _query_table_expression_ref_element: $ => seq(
            $.referenced_element,
            optional(
                choice(
                    $._partition_extension_clause,
                    $._modified_external_table,
                    $._hierachies_clause,
                ),
            ),
            optional($._sample_clause)
        ),
        _query_table_expression_lateral: $ => seq(
            $.kw_lateral,
            BRACKET_LEFT,
            $._subquery,
            optional($._subquery_restriction_clause),
            BRACKET_RIGHT,
        ),
        _partition_extension_clause: $ => seq(
            choice($.kw_partition,$.kw_subpartition),
            choice(
                seq(BRACKET_LEFT, $.identifier, BRACKET_RIGHT),
                seq($.kw_for, $._identifier_list),
            ),
        ),
        _modified_external_table: $ => seq(
            $.kw_external,
            $.kw_modify,
            optional($._modified_external_table_properties_default_directory),
            optional($._modified_external_table_properties_location),
            optional($._modified_external_table_properties_access),
            optional($._modified_external_table_properties_reject),
        ),
        _modified_external_table_properties_reject: $ => seq(
            $.kw_reject,
            $.kw_limit,
            choice(
                $.kw_unlimited,
                $._literal_number,
            ),
        ),
        _modified_external_table_properties_default_directory: $ => seq(
            $.kw_default,
            $.kw_directory,
            $.identifier,
        ),
        _modified_external_table_properties_location: $ => seq(
            $.kw_location,
            BRACKET_LEFT,
            $._modified_external_table_properties_location_element,
            repeat(seq(COMMA,$._modified_external_table_properties_location_element)),
            BRACKET_RIGHT,
        ),
        _modified_external_table_properties_access: $ => seq(
            $.kw_access,
            $.kw_parameters,
            repeat1(
                seq(
                    choice(
                        $.kw_badfile,
                        $.kw_logfile,
                        $.kw_discardfile,
                    ),
                    $.literal_string,
                ),
            ),
        ),
        _modified_external_table_properties_location_element: $ => seq(
            optional(seq($.identifier, DOUBLE_POINT)),
            $.literal_string,
        ),
        _sample_clause: $ => seq(
            $.kw_sample,
            optional($.kw_block),
            BRACKET_LEFT,
            $._literal_number,
            BRACKET_RIGHT,
            optional(seq($.kw_seed,BRACKET_LEFT, $._literal_number, BRACKET_RIGHT)),
        ),
        _container_clause: $ => seq(
            $.kw_containers,
            BRACKET_LEFT,
            $.referenced_element,
            BRACKET_RIGHT,
        ),
        _shards_clause: $ => seq(
            $.kw_shards,
            BRACKET_LEFT,
            $.referenced_element,
            BRACKET_RIGHT,
        ),
        _inner_cross_join_clause: $ => choice(
            $._inner_cross_join_clause_cross_natural,
            $._inner_cross_join_clause_inner,
        ),
        _inner_cross_join_clause_inner: $ => seq(
            optional($.kw_inner),
            $.kw_join,
            $._table_reference,
            $._join_on_using,
        ),
        _inner_cross_join_clause_cross_natural: $ => seq(
            choice(
                $.kw_cross,
                seq($.kw_natural,optional($.kw_inner)),
            ),
            $.kw_join,
            $._table_reference,
        ),
        _join_on_using: $ => choice(
            seq($.kw_on,$.expression),
            seq($.kw_using,$._identifier_list),
        ),
        _inline_analytic_view: $ => seq(
            $.kw_analytic,
            $.kw_view,
            $._sub_av_clause,
            optional($.kw_as),
            optional($.identifier),
        ),
        with_clause: $ => seq(
            $.kw_with,
            repeat(
                choice(
                    $.function_declaration,
                    $.procedure_declaration,
                ),
            ),
            repeat(
                choice(
                    $._subquery_factoring_clause,
                    $._subav_factoring_clause,
                ),
            ),
        ),
        _subquery_restriction_clause: $ => seq(
            $.kw_with,
            choice(
                seq($.kw_read,$.kw_only),
                seq($.kw_check,$.kw_option),
            ),
            optional(
                seq($.kw_constraint,$.identifier),
            ),
        ),
        _subquery_factoring_clause: $ => seq(
            field("query_name",$.identifier),
            optional($._referenced_element_list),
            $.kw_as,
            BRACKET_LEFT,
            $._subquery,
            BRACKET_RIGHT,
            optional($._search_clause),
            optional($._cycle_clause),
        ),
        _subav_factoring_clause: $ => seq(
            field("subav_name",$.identifier),
            $.kw_analytic,
            $.kw_view,
            $.kw_as,
            BRACKET_LEFT,
            $._sub_av_clause,
            BRACKET_RIGHT,
            optional($._search_clause),
            optional($._cycle_clause),
        ),
        _sub_av_clause: $ => seq(
            $.kw_using,
            $.referenced_element,
            optional($._hierachies_clause),
            optional($._filter_clauses),
            optional($._add_meas_clause),

        ),
        _hierachies_clause: $ => seq(
            $.kw_hierarchies,
            BRACKET_LEFT,
            optional($.referenced_element_repeat),
            BRACKET_RIGHT,
        ),
        _filter_clauses: $ => seq(
            $.kw_filter,
            $.kw_fact,
            BRACKET_LEFT,
            optional($._filter_clause),
            BRACKET_RIGHT,
        ),
        _filter_clause: $ => seq(
            $._hier_ids,
            $.kw_to,
            $.expression,
        ),
        _hier_ids: $ => seq(
            $._hier_id,
            repeat(
                seq(COMMA, $._hier_id),
            ),
        ),
        _hier_id: $ => choice(
            $.kw_measures,
            $.referenced_element,
        ),
        _add_meas_clause: $ => seq(
            $.kw_add,
            $.kw_measures,
            $._cube_meas_list,
        ),
        _cube_meas_list: $ => seq(
            BRACKET_LEFT,
            $._cube_meas,
            optional(seq(COMMA, $._cube_meas)),
            BRACKET_RIGHT,
        ),
        _cube_meas: $ => seq(
            $.identifier,
            choice(
                $._base_meas_clause,
                $._calc_meas_clause,
            ),
        ),
        _calc_meas_clause: $ => seq(
            $.identifier,
            $.kw_as,
            BRACKET_LEFT,
            $.expression,
            BRACKET_RIGHT,
        ),
        _base_meas_clause: $ => seq(
            $.kw_fact,
            $.kw_for,
            $.kw_measure,
            $.identifier,
            $._meas_aggrecate_clause,
        ),
        _meas_aggrecate_clause: $ => seq(
            $.kw_aggregate,
            $.kw_by,
            $.identifier,
        ),
        _cycle_clause: $ => seq(
            $.kw_cycle,
            $.referenced_element_repeat,
            $.kw_set,
            $.referenced_element,
            $.kw_to,
            $.literal_string,
            $.kw_default,
            $.literal_string,
        ),
        _search_clause: $ => seq(
            $.kw_search,
            choice($.kw_depth, $.kw_breadth),
            $.kw_first,
            $.kw_by,
            repeat1($._search_clause_alias),
            $.kw_set,
            $.identifier,
        ),
        _search_clause_alias: $ => seq(
          $.identifier,
          optional(
            choice($.kw_asc, $.kw_desc),
          ),
          optional(
            seq(
              $.kw_nulls,
              choice($.kw_first, $.kw_last),
            ),
          ),
        ),
        _subquery_element_union_intersect_minus: $ => seq(
          choice(
            seq($.kw_union,optional($.kw_all)),
            $.kw_intersect,
            $.kw_minus,
          ),
          $._subquery_element,
        ),
        order_by_clause: $ => seq(
          $.kw_order,
          optional($.kw_siblings),
          $.kw_by,
          $.order_by_clause_element,
          repeat(seq(COMMA,$.order_by_clause_element)),
        ),
        order_by_clause_element: $ => seq(
          $.expression,
          optional(
            choice($.kw_asc, $.kw_desc),
          ),
          optional(seq( $.kw_nulls, choice($.kw_first, $.kw_last)))),
        row_limiting_clause: $ => choice(
          $.row_limiting_clause_offset,
          $.row_limiting_clause_fetch
        ),
        row_limiting_clause_offset: $ => seq(
          $.kw_fetch,
          choice($.kw_first, $.kw_next),
          optional(
            seq(
              $.expression,
              optional($.kw_percent),
            ),
          ),
          choice($.kw_row, $.kw_rows),
          choice($.kw_only, seq($.kw_with, $.kw_ties)),
        ),
        row_limiting_clause_fetch: $ => seq(
          $.kw_offset,
          $.expression,
          choice($.kw_row, $.kw_rows),
        ),
        for_update_clause: $ => seq(
          $.kw_for,
          $.kw_update,
          optional(
            $.for_update_clause_of,
          ),
        ),
        for_update_clause_of: $ => seq(
          $.kw_of,
          $.referenced_element,
          repeat(seq(COMMA, $.referenced_element)),
        ),
        for_update_clause_extension: $ => choice(
          $.kw_nowait,
          seq($.kw_wait,$.number),
          seq($.kw_skip,$.kw_locked),
        ),
        // KW
        kw_pairs: _ => reservedWord("pairs"),
        kw_indices: _ => reservedWord("indices"),
        kw_values: _ => reservedWord("values"),
        kw_value: _ => reservedWord("value"),
        kw_repeat: _ => reservedWord("repeat"),
        kw_while: _ => reservedWord("while"),
        kw_reverse: _ => reservedWord("reverse"),
        kw_mutable: _ => reservedWord("mutable"),
        kw_immutable: _ => reservedWord("immutable"),
        kw_returning: _ => reservedWord("returning"),
        kw_execute: _ => reservedWord("execute"),
        kw_immediate: _ => reservedWord("immediate"),
        kw_open: _ => reservedWord("open"),
        kw_goto: _ => reservedWord("goto"),
        kw_pipe: _ => reservedWord("pipe"),
        kw_raise: _ => reservedWord("raise"),
        kw_exit: _ => reservedWord("exit"),
        kw_others: _ => reservedWord("others"),
        kw_continue: _ => reservedWord("continue"),
        kw_trim: _ => reservedWord("trim"),
        kw_close: _ => reservedWord("close"),
        kw_loop: _ => reservedWord("loop"),
        kw_group: _ => reservedWord("group"),
        kw_having: _ => reservedWord("having"),
        kw_connect: _ => reservedWord("connect"),
        kw_nocycle: _ => reservedWord("nocycle"),
        kw_start: _ => reservedWord("start"),
        kw_bulk: _ => reservedWord("bulk"),
        kw_collect: _ => reservedWord("collect"),
        kw_where: _ => reservedWord("where"),
        kw_read: _ => reservedWord("read"),
        kw_check: _ => reservedWord("check"),
        kw_option: _ => reservedWord("option"),
        kw_constraint: _ => reservedWord("constraint"),
        kw_lateral: _ => reservedWord("lateral"),
        kw_sample: _ => reservedWord("sample"),
        kw_block: _ => reservedWord("block"),
        kw_seed: _ => reservedWord("seed"),
        kw_shards: _ => reservedWord("shards"),
        kw_badfile: _ => reservedWord("badfile"),
        kw_logfile: _ => reservedWord("logfile"),
        kw_discardfile: _ => reservedWord("discardfile"),
        kw_reject: _ => reservedWord("reject"),
        kw_unlimited: _ => reservedWord("unlimited"),
        kw_access: _ => reservedWord("access"),
        kw_location: _ => reservedWord("location"),
        kw_directory: _ => reservedWord("directory"),
        kw_shard: _ => reservedWord("shard"),
        kw_containers: _ => reservedWord("containers"),
        kw_apply: _ => reservedWord("apply"),
        kw_full: _ => reservedWord("full"),
        kw_left: _ => reservedWord("left"),
        kw_right: _ => reservedWord("right"),
        kw_outer: _ => reservedWord("outer"),
        kw_partition: _ => reservedWord("partition"),
        kw_subpartition: _ => reservedWord("subpartition"),
        kw_on: _ => reservedWord("on"),
        kw_select: _ => reservedWord("select"),
        kw_from: _ => reservedWord("from"),
        kw_distinct: _ => reservedWord("distinct"),
        kw_unique: _ => reservedWord("unique"),
        kw_view: _ => reservedWord("view"),
        kw_aggregate: _ => reservedWord("aggregate"),
        kw_measure: _ => reservedWord("measure"),
        kw_measures: _ => reservedWord("measures"),
        kw_fact: _ => reservedWord("fact"),
        kw_filter: _ => reservedWord("filter"),
        kw_hierarchies: _ => reservedWord("hierarchies"),
        kw_using: _ => reservedWord("using"),
        kw_analytic: _ => reservedWord("analytic"),
        kw_cycle: _ => reservedWord("cycle"),
        kw_search: _ => reservedWord("search"),
        kw_depth: _ => reservedWord("depth"),
        kw_breadth: _ => reservedWord("breadth"),
        kw_minus: _ => reservedWord("minus"),
        kw_union: _ => reservedWord("union"),
        kw_intersect: _ => reservedWord("intersect"),
        kw_all: _ => reservedWord("all"),
        kw_offset: _ => reservedWord("offset"),
        kw_rows: _ => reservedWord("rows"),
        kw_fetch: _ => reservedWord("fetch"),
        kw_percent: _ => reservedWord("percent"),
        kw_only: _ => reservedWord("only"),
        kw_ties: _ => reservedWord("ties"),
        kw_asc: _ => reservedWord("asc"),
        kw_nulls: _ => reservedWord("nulls"),
        kw_desc: _ => reservedWord("desc"),
        kw_siblings: _ => reservedWord("siblings"),
        kw_nowait: _ => reservedWord("nowait"),
        kw_wait: _ => reservedWord("wait"),
        kw_skip: _ => reservedWord("skip"),
        kw_locked: _ => reservedWord("locked"),
        kw_lock: _ => reservedWord("lock"),
        kw_for: _ => reservedWord("for"),
        kw_update: _ => reservedWord("update"),
        kw_delete: _ => reservedWord("delete"),
        kw_create: _ => reservedWord("create"),
        kw_alter: _ => reservedWord("alter"),
        kw_package: _ => reservedWord("package"),
        kw_function: _ => reservedWord("function"),
        kw_procedure: _ => reservedWord("procedure"),
        kw_trigger: _ => reservedWord("trigger"),
        kw_type: _ => reservedWord("type"),
        kw_subtype: _ => reservedWord("subtype"),
        kw_datatype_type: _ => reservedWord("%type"),
        kw_datatype_rowtype: _ => reservedWord("%rowtype"),
        kw_library: _ => reservedWord("library"),
        kw_true: _ => reservedWord("true"),
        kw_false: _ => reservedWord("false"),
        kw_null: _ => reservedWord("null"),
        kw_not: _ => reservedWord("not"),
        kw_case: _ => reservedWord("case"),
        kw_when: _ => reservedWord("when"),
        kw_then: _ => reservedWord("then"),
        kw_if: _ => reservedWord("if"),
        kw_elsif: _ => reservedWord("elsif"),
        kw_else: _ => reservedWord("else"),
        kw_row: _ => reservedWord("row"),
        kw_count: _ => reservedWord("count"),
        kw_first: _ => reservedWord("first"),
        kw_last: _ => reservedWord("last"),
        kw_limit: _ => reservedWord("limit"),
        kw_next: _ => reservedWord("next"),
        kw_prior: _ => reservedWord("prior"),
        kw_rowcount: _ => reservedWord("rowcount"),
        kw_bulk_rowcount: _ => reservedWord("bulk_rowcount"),
        kw_compile: _ => reservedWord("compile"),
        kw_debug: _ => reservedWord("debug"),
        kw_specification: _ => reservedWord("specification"),
        kw_body: _ => reservedWord("body"),
        kw_declare: _ => reservedWord("declare"),
        kw_begin: _ => reservedWord("begin"),
        kw_exception: _ => reservedWord("exception"),
        kw_exceptions: _ => reservedWord("exceptions"),
        kw_end: _ => reservedWord("end"),
        kw_order: _ => reservedWord("order"),
        kw_or: _ => reservedWord("or"),
        kw_and: _ => reservedWord("and"),
        kw_replace: _ => reservedWord("replace"),
        kw_editionable: _ => reservedWord("editionable"),
        kw_noneditionable: _ => reservedWord("noneditionable"),
        kw_metadata: _ => reservedWord("metadata"),
        kw_none: _ => reservedWord("none"),
        kw_default: _ => reservedWord("default"),
        kw_collation: _ => reservedWord("collation"),
        kw_using_nls_comp: _ => reservedWord("using_nls_comp"),
        kw_authid: _ => reservedWord("authid"),
        kw_current_user: _ => reservedWord("current_user"),
        kw_definer: _ => reservedWord("definer"),
        kw_accessible: _ => reservedWord("accessible"),
        kw_by: _ => reservedWord("by"),
        kw_reuse: _ => reservedWord("reuse"),
        kw_reset: _ => reservedWord("reset"),
        kw_final: _ => reservedWord("final"),
        kw_overriding: _ => reservedWord("overriding"),
        kw_instantiable: _ => reservedWord("instantiable"),
        kw_member: _ => reservedWord("member"),
        kw_static: _ => reservedWord("static"),
        kw_settings: _ => reservedWord("settings"),
        kw_byte: _ => reservedWord("byte"),
        kw_char: _ => reservedWord("char"),
        kw_is: _ => reservedWord("is"),
        kw_as: _ => reservedWord("as"),
        kw_ref: _ => reservedWord("ref"),
        kw_table: _ => reservedWord("table"),
        kw_of: _ => reservedWord("of"),
        kw_index: _ => reservedWord("index"),
        kw_varray: _ => reservedWord("varray"),
        kw_array: _ => reservedWord("array"),
        kw_cursor: _ => reservedWord("cursor"),
        kw_record: _ => reservedWord("record"),
        kw_deterministic: _ => reservedWord("deterministic"),
        kw_pipelined: _ => reservedWord("pipelined"),
        kw_parallel_enable: _ => reservedWord("parallel_enable"),
        kw_enable: _ => reservedWord("enable"),
        kw_disable: _ => reservedWord("disable"),
        kw_rename: _ => reservedWord("rename"),
        kw_result_cache: _ => reservedWord("result_cache"),
        kw_exists: _ => reservedWord("exists"),
        kw_extend: _ => reservedWord("extend"),
        kw_between: _ => reservedWord("between"),
        kw_found: _ => reservedWord("found"),
        kw_isopen: _ => reservedWord("isopen"),
        kw_notfound: _ => reservedWord("notfound"),
        kw_in: _ => reservedWord("in"),
        kw_out: _ => reservedWord("out"),
        kw_nocopy: _ => reservedWord("nocopy"),
        kw_like: _ => reservedWord("like"),
        kw_range: _ => reservedWord("range"),
        kw_inserting: _ => reservedWord("inserting"),
        kw_deleting: _ => reservedWord("deleting"),
        kw_updating: _ => reservedWord("updating"),
        kw_return: _ => reservedWord("return"),
        kw_string: _ => reservedWord("string"),
        kw_varchar2: _ => reservedWord("varchar2"),
        kw_varchar: _ => reservedWord("varchar"),
        kw_nvarchar2: _ => reservedWord("nvarchar2"),
        kw_nchar: _ => reservedWord("nchar"),
        kw_int: _ => reservedWord("int"),
        kw_smallint: _ => reservedWord("smallint"),
        kw_real: _ => reservedWord("real"),
        kw_binary_float: _ => reservedWord("binary_float"),
        kw_binary_double: _ => reservedWord("binary_double"),
        kw_simple_float: _ => reservedWord("simple_float"),
        kw_simple_double: _ => reservedWord("simple_double"),
        kw_binary_integer: _ => reservedWord("binary_integer"),
        kw_pls_integer: _ => reservedWord("pls_integer"),
        kw_natural: _ => reservedWord("natural"),
        kw_naturaln: _ => reservedWord("naturaln"),
        kw_positive: _ => reservedWord("positive"),
        kw_positiven: _ => reservedWord("positiven"),
        kw_signtype: _ => reservedWord("signtype"),
        kw_simple_integer: _ => reservedWord("simple_integer"),
        kw_integer: _ => reservedWord("integer"),
        kw_number: _ => reservedWord("number"),
        kw_float: _ => reservedWord("float"),
        kw_long: _ => reservedWord("long"),
        kw_raw: _ => reservedWord("raw"),
        kw_date: _ => reservedWord("date"),
        kw_timestamp: _ => reservedWord("timestamp"),
        kw_join: _ => reservedWord("join"),
        kw_cross: _ => reservedWord("cross"),
        kw_inner: _ => reservedWord("inner"),
        kw_with: _ => reservedWord("with"),
        kw_context: _ => reservedWord("context"),
        kw_self: _ => reservedWord("self"),
        kw_local: _ => reservedWord("local"),
        kw_time: _ => reservedWord("time"),
        kw_zone: _ => reservedWord("zone"),
        kw_interval: _ => reservedWord("interval"),
        kw_year: _ => reservedWord("year"),
        kw_month: _ => reservedWord("month"),
        kw_day: _ => reservedWord("day"),
        kw_minute: _ => reservedWord("minute"),
        kw_second: _ => reservedWord("second"),
        kw_to: _ => reservedWord("to"),
        kw_blob: _ => reservedWord("blob"),
        kw_clob: _ => reservedWord("clob"),
        kw_nclob: _ => reservedWord("nclob"),
        kw_bfile: _ => reservedWord("bfile"),
        kw_rowid: _ => reservedWord("rowid"),
        kw_urowid: _ => reservedWord("urowid"),
        kw_boolean: _ => reservedWord("boolean"),
        kw_character: _ => reservedWord("character"),
        kw_set: _ => reservedWord("set"),
        kw_varying: _ => reservedWord("varying"),
        kw_numeric: _ => reservedWord("numeric"),
        kw_decimal: _ => reservedWord("decimal"),
        kw_dec: _ => reservedWord("dec"),
        kw_double: _ => reservedWord("double"),
        kw_precision: _ => reservedWord("precision"),
        kw_sys: _ => reservedWord("sys"),
        kw_anydata: _ => reservedWord("anydata"),
        kw_anytype: _ => reservedWord("anytype"),
        kw_anydataset: _ => reservedWord("anydataset"),
        kw_xmltype: _ => reservedWord("xmltype"),
        kw_uritype: _ => reservedWord("uritype"),
        kw_sdo_geometry: _ => reservedWord("sdo_geometry"),
        kw_sdo_topo_geometry: _ => reservedWord("sdo_topo_geometry"),
        kw_sdo_georaster: _ => reservedWord("sdo_georaster"),
        kw_constant: _ => reservedWord("constant"),
        kw_json_element_t: _ => reservedWord("json_element_t"),
        kw_json_array_t: _ => reservedWord("json_array_t"),
        kw_json_object_t: _ => reservedWord("json_object_t"),
        kw_json_scalar_t: _ => reservedWord("json_scalar_t"),
        kw_json_key_list: _ => reservedWord("json_key_list"),
        kw_language: _ => reservedWord("language"),
        kw_java: _ => reservedWord("java"),
        kw_name: _ => reservedWord("name"),
        kw_c: _ => reservedWord("c"),
        kw_external: _ => reservedWord("external"),
        kw_agent: _ => reservedWord("agent"),
        kw_parameters: _ => reservedWord("parameters"),
        kw_tdo: _ => reservedWord("tdo"),
        kw_indicator: _ => reservedWord("indicator"),
        kw_length: _ => reservedWord("length"),
        kw_duration: _ => reservedWord("duration"),
        kw_maxlen: _ => reservedWord("maxlen"),
        kw_charsetid: _ => reservedWord("charsetid"),
        kw_charsetfrom: _ => reservedWord("charsetfrom"),
        kw_struct: _ => reservedWord("struct"),
        kw_reference: _ => reservedWord("reference"),
        kw_object: _ => reservedWord("object"),
        kw_map: _ => reservedWord("map"),
        kw_constructor: _ => reservedWord("constructor"),
        kw_result: _ => reservedWord("result"),
        kw_invalidate: _ => reservedWord("invalidate"),
        kw_cascade: _ => reservedWord("cascade"),
        kw_convert: _ => reservedWord("convert"),
        kw_substitutable: _ => reservedWord("substitutable"),
        kw_including: _ => reservedWord("including"),
        kw_data: _ => reservedWord("data"),
        kw_force: _ => reservedWord("force"),
        kw_comment: _ => reservedWord("comment"),
        kw_write: _ => reservedWord("write"),
        kw_batch: _ => reservedWord("batch"),
        kw_into: _ => reservedWord("into"),
        kw_add: _ => reservedWord("add"),
        kw_drop: _ => reservedWord("drop"),
        kw_modify: _ => reservedWord("modify"),
        kw_attribute: _ => reservedWord("attribute"),
        kw_element: _ => reservedWord("element"),
        kw_validate: _ => reservedWord("validate"),
        kw_pragma: _ => reservedWord("pragma"),
        kw_asterisk: _ => reservedWord("*"),
        kw_pivot: _ => reservedWord("pivot"),
        kw_xml: _ => reservedWord("xml"),
        kw_commit: _ => reservedWord("commit"),
        kw_rollback: _ => reservedWord("rollback"),
        kw_work: _ => reservedWord("work"),
        kw_savepoint: _ => reservedWord("savepoint"),
        kw_transaction: _ => reservedWord("transaction"),
        kw_isolation: _ => reservedWord("isolation"),
        kw_level: _ => reservedWord("level"),
        kw_serializable: _ => reservedWord("serializable"),
        kw_commtted: _ => reservedWord("committed"),
        kw_segment: _ => reservedWord("segment"),
        kw_use: _ => reservedWord("use"),
        kw_mode: _ => reservedWord("mode"),
        kw_errors: _ => reservedWord("errors"),
        kw_log: _ => reservedWord("log"),
    },
});

